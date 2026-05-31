from urllib.parse import urlparse

from app.core.errors import ChatReadyError, FRIENDLY_URL_ERROR

ALLOWED_URL_SCHEMES = {"http", "https"}


def validate_url(url: str) -> str:
    normalized_url = url.strip()
    parsed_url = urlparse(normalized_url)

    if parsed_url.scheme not in ALLOWED_URL_SCHEMES:
        raise _invalid_url_error()

    if not parsed_url.netloc:
        raise _invalid_url_error()

    return normalized_url


def _invalid_url_error() -> ChatReadyError:
    return ChatReadyError(
        code="unsupported_url",
        message=FRIENDLY_URL_ERROR,
        status_code=400,
    )
