"""Self-checks for the pure logic: text cleanup, SSRF guards, URL parsing.

Run with: python test_conversion.py
"""

from app.core.errors import ChatReadyError
from app.services.markdown_converter import (
    _extract_youtube_video_id,
    _is_scanned_pdf,
    _is_youtube_url,
)
from app.services.text_cleanup import clean_page_text, normalize
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
