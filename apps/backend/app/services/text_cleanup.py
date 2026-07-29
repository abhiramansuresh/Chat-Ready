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

# Table detection. A gap of three spaces separates columns; ordinary prose uses
# one or two (including after a sentence), so this stays clear of normal text.
TABLE_MIN_GAP = 3
TABLE_MIN_ROWS = 2
TABLE_MIN_COLUMNS = 2
# A column boundary must be blank in every row of the block, for at least this
# many characters.
TABLE_SEPARATOR_WIDTH = 2
# Side-by-side prose columns are also space-aligned, but their cells are
# sentences rather than values. Formatting those as a table would assert a
# relationship between the columns that does not exist, so a block whose every
# column averages more than this many words per cell is left alone.
TABLE_MAX_CELL_WORDS = 3

_TRAILING_WHITESPACE = re.compile(r"[ \t]+$", re.MULTILINE)
_BLANK_LINE_RUN = re.compile(r"\n{3,}")
_SPACE_RUN = re.compile(f" {{{SPACE_RUN_THRESHOLD},}}")
_TABULAR_LINE = re.compile(f"\\S {{{TABLE_MIN_GAP},}}\\S")
_RULE_LINE = re.compile(r"^[\s\-=_|+*~]+$")

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

    Drops running headers/footers and page numbers, rebuilds space-aligned
    tables as Markdown, then collapses the column padding that layout-preserving
    extraction leaves behind.
    """
    kept_pages = _drop_page_furniture(pages)
    # Tables must be found before the padding is collapsed: the alignment *is*
    # the column information.
    rendered_pages = [render_tables(page) for page in kept_pages]
    body = "\n\n".join(page for page in rendered_pages if page.strip())
    body = _SPACE_RUN.sub(" " * MAX_CONSECUTIVE_SPACES, body)
    return normalize(body)


def render_tables(page: str) -> str:
    """Converts blocks of space-aligned columns into Markdown tables.

    Layout-preserving extraction renders a table as padded text. A model reading
    that has to infer which value belongs to which column from character
    positions, and frequently gets it wrong. A pipe table states it outright.
    """
    output: list[str] = []
    block: list[str] = []

    for line in page.split("\n"):
        if _TABULAR_LINE.search(line):
            block.append(line)
            continue

        # An ASCII rule inside a table is decoration; drop it and keep the block
        # together rather than splitting the table in two.
        if block and line.strip() and _RULE_LINE.match(line):
            continue

        output.extend(_flush_block(block))
        block = []
        output.append(line)

    output.extend(_flush_block(block))

    return "\n".join(output)


def _flush_block(block: list[str]) -> list[str]:
    if len(block) < TABLE_MIN_ROWS:
        return block

    rows = _split_columns(block)

    if rows is None:
        return block

    header, *body = rows
    markdown = [
        _table_row(header),
        _table_row(["---"] * len(header)),
        *(_table_row(row) for row in body),
    ]

    return markdown


def _split_columns(block: list[str]) -> list[list[str]] | None:
    """Returns one cell list per line, or None if the block is not a table."""
    width = max(len(line) for line in block)
    padded = [line.ljust(width) for line in block]
    is_blank_column = [
        all(line[index] == " " for line in padded) for index in range(width)
    ]
    spans = _column_spans(is_blank_column, width)

    if len(spans) < TABLE_MIN_COLUMNS:
        return None

    rows = [[line[start:end].strip() for start, end in spans] for line in padded]

    # Guard against a block where the alignment was coincidental and most cells
    # come out empty.
    populated_rows = sum(
        1 for row in rows if sum(1 for cell in row if cell) >= TABLE_MIN_COLUMNS
    )

    if populated_rows < TABLE_MIN_ROWS or _is_prose_columns(rows):
        return None

    return rows


def _is_prose_columns(rows: list[list[str]]) -> bool:
    """True when every column reads as running text rather than values."""
    column_count = len(rows[0])

    for index in range(column_count):
        cells = [row[index] for row in rows if row[index]]

        if not cells:
            return False

        mean_words = sum(len(cell.split()) for cell in cells) / len(cells)

        if mean_words <= TABLE_MAX_CELL_WORDS:
            return False

    return True


def _column_spans(is_blank_column: list[bool], width: int) -> list[tuple[int, int]]:
    spans: list[tuple[int, int]] = []
    cursor = 0
    index = 0

    while index < width:
        if not is_blank_column[index]:
            index += 1
            continue

        blank_end = index

        while blank_end < width and is_blank_column[blank_end]:
            blank_end += 1

        if blank_end - index >= TABLE_SEPARATOR_WIDTH:
            if cursor < index:
                spans.append((cursor, index))
            # Leading indentation lands here with cursor == index, which
            # correctly adds no column.
            cursor = blank_end

        index = blank_end

    if cursor < width:
        spans.append((cursor, width))

    return spans


def _table_row(cells: list[str]) -> str:
    escaped = [cell.replace("|", "\\|") for cell in cells]
    return f"| {' | '.join(escaped)} |"


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
