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

# Query parameters that exist for analytics, not for finding the page. They are
# frequently longer than the URL that carries them.
TRACKING_PARAMETERS = frozenset(
    {
        "cmpid", "ef_id", "fbclid", "gbraid", "gclid", "igshid", "mc_cid",
        "mc_eid", "msclkid", "mkt_tok", "oly_anon_id", "oly_enc_id", "s_kwcid",
        "twclid", "vero_conv", "vero_id", "wbraid", "yclid", "_ga", "_gl",
        "ref_src", "ref_url",
    }
)
TRACKING_PARAMETER_PREFIXES = ("utm_", "pk_", "piwik_", "hsa_", "at_")

# Cells that carry no information. pandas writes NaN for blanks and
# "Unnamed: N" for columns with no header.
_EMPTY_CELL_VALUES = frozenset({"", "-", "nan", "none", "null", "n/a"})
_UNNAMED_COLUMN = re.compile(r"^unnamed:?\s*\d+$", re.IGNORECASE)
_TRAILING_ZERO_DECIMAL = re.compile(r"^(-?\d+)\.0$")

_DATA_URI = re.compile(r"data:[\w.+-]+/[\w.+-]+;base64,[A-Za-z0-9+/=\s]+")
_MARKDOWN_LINK_TARGET = re.compile(r"(!?\[[^\]]*\]\()([^)\s]+)((?:\s+\"[^\"]*\")?\))")
_TABLE_LINE = re.compile(r"^\s*\|.*\|\s*$")
_SEPARATOR_CELL = re.compile(r"^:?-{2,}:?$")

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


def compact_markdown(text: str) -> str:
    """Removes content that costs tokens without telling a model anything.

    Measured on a typical article page, the base64 image alone was 77% of the
    converted output; a spreadsheet with nine real values cost 1,170 tokens
    almost entirely in empty cells.
    """
    text = strip_data_uris(text)
    text = strip_tracking_parameters(text)
    text = compact_tables(text)
    return normalize(text)


def strip_data_uris(text: str) -> str:
    """Replaces inline base64 payloads with a short placeholder.

    A model cannot decode base64 into an image, so the payload is pure cost.
    The placeholder keeps the fact that an image was there.
    """
    return _DATA_URI.sub("embedded-image", text)


def strip_tracking_parameters(text: str) -> str:
    """Drops analytics query parameters from Markdown link targets."""

    def clean(match: re.Match[str]) -> str:
        prefix, target, suffix = match.groups()
        return f"{prefix}{_clean_url(target)}{suffix}"

    return _MARKDOWN_LINK_TARGET.sub(clean, text)


def _clean_url(url: str) -> str:
    if "?" not in url:
        return url

    base, _, query = url.partition("?")
    query, separator, fragment = query.partition("#")

    kept = [
        pair
        for pair in query.split("&")
        if pair and not _is_tracking_parameter(pair.partition("=")[0].lower())
    ]

    rebuilt = f"{base}?{'&'.join(kept)}" if kept else base

    return f"{rebuilt}{separator}{fragment}"


def _is_tracking_parameter(name: str) -> bool:
    return name in TRACKING_PARAMETERS or name.startswith(TRACKING_PARAMETER_PREFIXES)


def compact_tables(text: str) -> str:
    """Drops all-empty rows and columns from Markdown tables.

    Spreadsheet exports routinely carry a grid far larger than their data: one
    stray cell turns three rows into a wall of NaN.
    """
    lines = text.split("\n")
    output: list[str] = []
    block: list[str] = []

    for line in lines:
        if _TABLE_LINE.match(line):
            block.append(line)
            continue

        output.extend(_compact_table_block(block))
        block = []
        output.append(line)

    output.extend(_compact_table_block(block))

    return "\n".join(output)


def _compact_table_block(block: list[str]) -> list[str]:
    if len(block) < 2:
        return block

    rows = [_split_table_row(line) for line in block]
    width = max(len(row) for row in rows)
    rows = [row + [""] * (width - len(row)) for row in rows]

    separator_indexes = {
        index
        for index, row in enumerate(rows)
        if row and all(_SEPARATOR_CELL.match(cell.strip()) for cell in row if cell.strip())
        and any(cell.strip() for cell in row)
    }
    content_indexes = [index for index in range(len(rows)) if index not in separator_indexes]

    if not content_indexes:
        return block

    header_index = content_indexes[0]
    keep_columns = [
        column
        for column in range(width)
        if any(not _is_empty_cell(rows[index][column]) for index in content_indexes)
        or not _is_empty_cell(rows[header_index][column])
    ]

    if not keep_columns:
        return block

    kept_rows: list[list[str]] = []

    for index, row in enumerate(rows):
        cells = [_tidy_cell(row[column]) for column in keep_columns]

        if index in separator_indexes:
            kept_rows.append(["---"] * len(keep_columns))
            continue

        # Keep the header even if it is blank; drop empty body rows.
        if index != header_index and all(not cell for cell in cells):
            continue

        kept_rows.append(cells)

    if len(kept_rows) < 2:
        return block

    return [f"| {' | '.join(row)} |" for row in kept_rows]


def _split_table_row(line: str) -> list[str]:
    stripped = line.strip()
    # A Markdown row is delimited by leading and trailing pipes; removing them
    # first keeps split() from producing phantom empty cells at both ends.
    if stripped.startswith("|"):
        stripped = stripped[1:]
    if stripped.endswith("|") and not stripped.endswith("\\|"):
        stripped = stripped[:-1]

    return [cell.strip() for cell in stripped.split("|")]


def _is_empty_cell(cell: str) -> bool:
    value = cell.strip().lower()
    return value in _EMPTY_CELL_VALUES or _UNNAMED_COLUMN.match(value) is not None


def _tidy_cell(cell: str) -> str:
    value = cell.strip()

    if _is_empty_cell(value):
        return ""

    # pandas renders every number as a float; "100.0" costs more than "100"
    # and means the same thing.
    return _TRAILING_ZERO_DECIMAL.sub(r"\1", value)


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
    return normalize(compact_tables(body))


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
