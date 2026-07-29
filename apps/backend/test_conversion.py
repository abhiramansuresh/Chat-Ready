"""Self-checks for the pure logic: text cleanup, SSRF guards, URL parsing.

Run with: python test_conversion.py
"""

from app.core.errors import ChatReadyError
from app.services.markdown_converter import (
    _extract_youtube_video_id,
    _is_damaged_text,
    _is_scanned_pdf,
    _is_youtube_url,
    _needs_ocr,
)
from app.services.text_cleanup import clean_page_text, normalize, render_tables
from app.services.url_validation import validate_url


def test_normalize() -> None:
    assert normalize("a  \nb\t\n") == "a\nb"
    assert normalize("a\n\n\n\n\nb") == "a\n\nb"
    assert normalize("a\r\nb\rc\fd") == "a\nb\nc\nd"
    # Single blank line between paragraphs is meaningful Markdown — keep it.
    assert normalize("# Title\n\nBody") == "# Title\n\nBody"


def test_clean_page_text_drops_running_headers() -> None:
    pages = [
        "Acme Annual Report\n\nRevenue grew this year.\n\n1",
        "Acme Annual Report\n\nCosts stayed flat.\n\n2",
        "Acme Annual Report\n\nOutlook is positive.\n\n3",
    ]
    cleaned = clean_page_text(pages)

    assert "Acme Annual Report" not in cleaned
    assert "Revenue grew this year." in cleaned
    assert "Outlook is positive." in cleaned
    # Page numbers at page edges go too.
    assert "\n1" not in cleaned and "\n2" not in cleaned


def test_clean_page_text_keeps_body_numbers() -> None:
    # A standalone number in the middle of a page is content, not furniture.
    pages = [
        "Revenue by year\n2024\nGrowth was steady.",
        "Headcount by region\n1987\nHiring slowed.",
        "Offices opened\n2011\nThree new sites.",
    ]
    cleaned = clean_page_text(pages)

    assert "2024" in cleaned
    assert "1987" in cleaned


def test_clean_page_text_needs_enough_pages() -> None:
    # Two pages is not enough evidence to call a repeated line a header.
    pages = ["Shared Title\nUnique one", "Shared Title\nUnique two"]
    cleaned = clean_page_text(pages)

    assert "Shared Title" in cleaned


def test_clean_page_text_collapses_layout_padding() -> None:
    padded = "Item" + " " * 30 + "Qty" + " " * 20 + "Price"
    cleaned = clean_page_text([padded])

    assert cleaned == "Item    Qty    Price"
    # Column breaks survive, so a model can still see the table shape.
    assert cleaned.count("    ") == 2


def test_clean_page_text_saves_tokens() -> None:
    pages = [f"CONFIDENTIAL — Acme Corp\n\nParagraph {n}." + " " * 40 + f"\n\n{n}" for n in range(1, 9)]
    before = len("\n\n".join(pages))
    after = len(clean_page_text(pages))

    assert after < before * 0.6, f"expected meaningful reduction, got {before} -> {after}"


def test_render_tables_builds_markdown() -> None:
    page = (
        "Invoice summary\n"
        "\n"
        "Item              Qty        Price\n"
        "-----------------------------------\n"
        "Widget              2        $5.00\n"
        "Gadget             10       $12.50\n"
        "\n"
        "Thank you for your business."
    )
    rendered = render_tables(page)

    assert "| Item | Qty | Price |" in rendered
    assert "| --- | --- | --- |" in rendered
    assert "| Widget | 2 | $5.00 |" in rendered
    assert "| Gadget | 10 | $12.50 |" in rendered
    # Surrounding prose is untouched, and the ASCII rule is gone.
    assert "Invoice summary" in rendered
    assert "Thank you for your business." in rendered
    assert "-----" not in rendered


def test_render_tables_leaves_prose_alone() -> None:
    prose = (
        "This is a normal sentence.  It has two spaces after the period.\n"
        "This is another line of ordinary running text in a paragraph.\n"
        "  - An indented bullet point\n"
        "  - Another bullet point"
    )

    assert render_tables(prose) == prose


def test_render_tables_skips_two_column_prose() -> None:
    # Side-by-side prose from a two-column PDF is space-aligned like a table,
    # but formatting it as one asserts a row relationship that does not exist.
    columns = (
        "The quick brown fox jumps over          Meanwhile in another column\n"
        "the lazy dog and continues on           entirely different text runs\n"
        "for several lines of prose here         alongside the first column"
    )

    assert render_tables(columns) == columns


def test_render_tables_keeps_numeric_tables() -> None:
    # A financial table has a blank header cell and wordy row labels; it must
    # still be recognised.
    page = (
        "                                    2025          2024\n"
        "Revenue                         1,204,000       980,500\n"
        "Cost of goods sold               (610,300)     (502,100)"
    )
    rendered = render_tables(page)

    assert "| Revenue | 1,204,000 | 980,500 |" in rendered
    assert "| Cost of goods sold | (610,300) | (502,100) |" in rendered


def test_render_tables_needs_two_rows() -> None:
    # A single spaced-out line is a heading, not a table.
    single = "Chapter One          Introduction"

    assert render_tables(single) == single


def test_render_tables_escapes_pipes() -> None:
    page = "A | B            C\nD                E"
    rendered = render_tables(page)

    assert r"A \| B" in rendered


def test_damaged_text_detection() -> None:
    normal = " ".join(["ordinary"] * 40)
    assert _is_damaged_text(normal) is False
    assert _needs_ocr(normal) is False

    # Letter-spaced output from a broken embedded font.
    letter_spaced = " ".join("t h i s i s w h a t a b r o k e n f o n t l o o k s l i k e".split())
    assert _is_damaged_text(letter_spaced) is True
    assert _needs_ocr(letter_spaced) is True

    # Replacement characters from a bad encoding map.
    assert _is_damaged_text("�" * 200 + " ".join(["word"] * 40)) is True

    # Symbol soup.
    assert _is_damaged_text(" ".join(["@#$%^&*"] * 40)) is True

    # A numeric table is content, not damage.
    numbers = " ".join(["1,234.56"] * 40)
    assert _is_damaged_text(numbers) is False


def test_scanned_pdf_detection() -> None:
    assert _is_scanned_pdf("") is True
    assert _is_scanned_pdf("1\n2\n3\n4\n5") is True
    assert _is_scanned_pdf("short text") is True
    assert _is_scanned_pdf(" ".join(["word"] * 50)) is False


def test_youtube_url_parsing() -> None:
    assert _is_youtube_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ") is True
    assert _is_youtube_url("https://youtu.be/dQw4w9WgXcQ") is True
    assert _is_youtube_url("https://example.com") is False

    assert _extract_youtube_video_id("https://youtu.be/dQw4w9WgXcQ") == "dQw4w9WgXcQ"
    assert (
        _extract_youtube_video_id("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        == "dQw4w9WgXcQ"
    )
    assert (
        _extract_youtube_video_id("https://www.youtube.com/shorts/dQw4w9WgXcQ")
        == "dQw4w9WgXcQ"
    )
    assert _extract_youtube_video_id("https://www.youtube.com/") is None


def test_url_validation_blocks_internal_targets() -> None:
    blocked = [
        "http://169.254.169.254/latest/meta-data/",  # cloud metadata
        "http://127.0.0.1:8000/health",
        "http://localhost:8000/health",
        "http://10.0.0.1/",
        "http://192.168.1.1/",
        "http://172.16.0.1/",
        "http://[::1]/",
        "http://0.0.0.0/",
        "http://[::ffff:127.0.0.1]/",
        "file:///etc/passwd",
        "gopher://example.com/",
        "http:///nohost",
        # Decimal and hex encodings of 127.0.0.1.
        "http://2130706433/",
        "http://0x7f000001/",
    ]

    for url in blocked:
        try:
            validate_url(url)
        except ChatReadyError:
            continue
        raise AssertionError(f"expected {url} to be rejected")


def test_url_validation_allows_public_hosts() -> None:
    assert validate_url("  https://example.com/article  ") == "https://example.com/article"
    assert validate_url("http://8.8.8.8/") == "http://8.8.8.8/"


def main() -> None:
    tests = [value for name, value in sorted(globals().items()) if name.startswith("test_")]

    for test in tests:
        test()
        print(f"ok  {test.__name__}")

    print(f"\n{len(tests)} passed")


if __name__ == "__main__":
    main()
