"""Strips page furniture from HTML before it is converted to Markdown.

Navigation, cookie banners, and footer link farms convert into Markdown just as
faithfully as the article does, and on a typical page they outweigh it. Removing
them before conversion is where most of the token saving on a web page comes
from.
"""

from bs4 import BeautifulSoup, Tag

# Elements that never carry the content someone came to read.
DISCARDED_TAGS = (
    "script",
    "style",
    "noscript",
    "nav",
    "footer",
    "aside",
    "form",
    "iframe",
    "svg",
    "template",
)

# Matched against id and class attributes.
DISCARDED_HINTS = (
    "cookie",
    "consent",
    "gdpr",
    "newsletter",
    "subscribe",
    "advert",
    "promo",
    "sidebar",
    "breadcrumb",
    "share",
    "social",
    "related",
    "recirc",
    "paywall",
    "skip-link",
)

# Preferring <article>/<main> is the single biggest win, but getting it wrong
# discards the document. It is only used when it holds most of the page's text.
MAIN_CONTENT_MIN_RATIO = 0.4
MAIN_CONTENT_MIN_CHARS = 200


def strip_boilerplate(html: str) -> str:
    """Returns HTML with navigation and chrome removed.

    Falls back to the original string if parsing fails or the result looks
    empty — a smaller document is worthless if it lost the content.
    """
    try:
        soup = BeautifulSoup(html, "html.parser")
    except Exception:
        return html

    for element in soup(list(DISCARDED_TAGS)):
        element.decompose()

    for element in soup.find_all(_has_discarded_hint):
        element.decompose()

    root = _main_content(soup) or soup
    cleaned = str(root)

    return cleaned if _has_text(root) else html


def _has_discarded_hint(element: Tag) -> bool:
    identifiers = " ".join(
        [
            str(element.get("id") or ""),
            " ".join(element.get("class") or []),
            str(element.get("role") or ""),
        ]
    ).lower()

    return any(hint in identifiers for hint in DISCARDED_HINTS)


def _main_content(soup: BeautifulSoup) -> Tag | None:
    body_length = len(soup.get_text(strip=True))

    if not body_length:
        return None

    candidates = soup.find_all(["main", "article"])

    if not candidates:
        return None

    best = max(candidates, key=lambda tag: len(tag.get_text(strip=True)))
    best_length = len(best.get_text(strip=True))

    if best_length < MAIN_CONTENT_MIN_CHARS:
        return None

    return best if best_length / body_length >= MAIN_CONTENT_MIN_RATIO else None


def _has_text(root: Tag) -> bool:
    return bool(root.get_text(strip=True))
