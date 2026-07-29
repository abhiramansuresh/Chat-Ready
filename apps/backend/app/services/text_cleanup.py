"""Normalizes extracted text before it reaches an LLM.

Both product goals point the same way here: page furniture (running headers,
footers, page numbers) and layout padding cost tokens *and* make the document
harder for a model to follow. Stripping them shrinks the output and improves
what the model actually reads.
"""

from collections import Counter
import re

# pdftotext -layout pads columns with long space runs. Four spaces is enough to
# keep a column break visible without paying for thirty.
MAX_CONSECUTIVE_SPACES = 4
SPACE_RUN_THRESHOLD = 5

# A repeated short line is treated as page furniture only when it shows up on
# most pages of a document that has enough pages to establish the pattern.
FURNITURE_MAX_CHARS = 90
FURNITURE_MIN_PAGES = 3
FURNITURE_PAGE_RATIO = 0.6

_TRAILING_WHITESPACE = re.compile(r"[ \t]+$", re.MULTILINE)
_BLANK_LINE_RUN = re.compile(r"\n{3,}")
_SPACE_RUN = re.compile(f" {{{SPACE_RUN_THRESHOLD},}}")

# Digits only, on purpose: a roman-numeral pattern also matches ordinary words
# such as "civil", and silently deleting a real line is worse than keeping a
# stray page number.
_PAGE_NUMBER_LINE = re.compile(
    r"^(?:page\s*)?\d{1,4}(?:\s*(?:of|/|-|–|—)\s*\d{1,4})?$",
    re.IGNORECASE,
)


def normalize(text: str) -> str:
    """Whitespace-only cleanup that is safe for already-structured Markdown."""
    text = text.replace("\r\n", "\n").replace("\r", "\n").replace("\f", "\n")
    text = _TRAILING_WHITESPACE.sub("", text)
    text = _BLANK_LINE_RUN.sub("\n\n", text)
    return text.strip()


def clean_page_text(pages: list[str]) -> str:
    """Cleanup for page-oriented extraction (PDF text layer, OCR).

    Drops running headers/footers and page numbers, then collapses the column
    padding that layout-preserving extraction leaves behind.
    """
    kept_pages = _drop_page_furniture(pages)
    body = "\n\n".join(page for page in kept_pages if page.strip())
    body = _SPACE_RUN.sub(" " * MAX_CONSECUTIVE_SPACES, body)
    return normalize(body)


def _drop_page_furniture(pages: list[str]) -> list[str]:
    page_lines = [page.split("\n") for page in pages]
    repeated = _repeated_short_lines(page_lines)
    has_multiple_pages = len(page_lines) > 1

    cleaned_pages: list[str] = []

    for lines in page_lines:
        edges = _edge_line_indexes(lines)
        kept = [
            line
            for index, line in enumerate(lines)
            if not _is_furniture(
                line=line,
                is_edge=index in edges,
                repeated=repeated,
                has_multiple_pages=has_multiple_pages,
            )
        ]
        cleaned_pages.append("\n".join(kept))

    return cleaned_pages


def _is_furniture(
    line: str,
    is_edge: bool,
    repeated: frozenset[str],
    has_multiple_pages: bool,
) -> bool:
    stripped = line.strip()

    if not stripped:
        return False

    if stripped in repeated:
        return True

    # Page numbers live at the top or bottom of a page. Restricting to the edges
    # keeps a standalone year or figure number in the body from being deleted.
    return (
        has_multiple_pages
        and is_edge
        and _PAGE_NUMBER_LINE.match(stripped) is not None
    )


def _edge_line_indexes(lines: list[str]) -> set[int]:
    populated = [index for index, line in enumerate(lines) if line.strip()]

    if not populated:
        return set()

    return {populated[0], populated[-1]}


def _repeated_short_lines(page_lines: list[list[str]]) -> frozenset[str]:
    if len(page_lines) < FURNITURE_MIN_PAGES:
        return frozenset()

    pages_containing: Counter[str] = Counter()

    for lines in page_lines:
        candidates = {
            stripped
            for line in lines
            if (stripped := line.strip()) and len(stripped) <= FURNITURE_MAX_CHARS
        }
        pages_containing.update(candidates)

    threshold = max(
        FURNITURE_MIN_PAGES,
        round(len(page_lines) * FURNITURE_PAGE_RATIO),
    )

    return frozenset(
        line for line, count in pages_containing.items() if count >= threshold
    )
