from dataclasses import dataclass
from os import getenv
from pathlib import Path

from dotenv import load_dotenv

BACKEND_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_ALLOWED_ORIGINS = ("http://localhost:3000",)
DEFAULT_MAX_UPLOAD_SIZE_MB = 25
DEFAULT_RATE_LIMIT_REQUESTS = 60
DEFAULT_RATE_LIMIT_WINDOW_SECONDS = 60
# Tesseract slows down roughly in proportion to the number of languages it has
# to consider, so this is a Latin-script set by default. The Docker image also
# ships Chinese, Japanese, Arabic, Hindi, and Russian for anyone who widens it.
DEFAULT_OCR_LANGUAGES = "eng+fra+deu+spa+ita+por+nld"

load_dotenv(BACKEND_ROOT / ".env")


def _read_allowed_origins() -> tuple[str, ...]:
    value = getenv("ALLOWED_ORIGINS")

    if value is None:
        return DEFAULT_ALLOWED_ORIGINS

    origins = tuple(origin.strip() for origin in value.split(",") if origin.strip())
    return origins or DEFAULT_ALLOWED_ORIGINS


def _read_max_upload_size_mb() -> int:
    return _read_positive_int("MAX_UPLOAD_SIZE_MB", DEFAULT_MAX_UPLOAD_SIZE_MB)


def _read_positive_int(name: str, default_value: int) -> int:
    value = getenv(name)

    if value is None:
        return default_value

    try:
        parsed_value = int(value)
    except ValueError:
        return default_value

    if parsed_value <= 0:
        return default_value

    return parsed_value


@dataclass(frozen=True)
class Settings:
    app_name: str
    environment: str
    allowed_origins: tuple[str, ...]
    max_upload_size_mb: int
    rate_limit_requests: int
    rate_limit_window_seconds: int
    ocr_languages: str
    log_error_detail: bool

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


settings = Settings(
    app_name="ChatReady API",
    environment=getenv("ENVIRONMENT", "development"),
    allowed_origins=_read_allowed_origins(),
    max_upload_size_mb=_read_max_upload_size_mb(),
    rate_limit_requests=_read_positive_int(
        "RATE_LIMIT_REQUESTS",
        DEFAULT_RATE_LIMIT_REQUESTS,
    ),
    rate_limit_window_seconds=_read_positive_int(
        "RATE_LIMIT_WINDOW_SECONDS",
        DEFAULT_RATE_LIMIT_WINDOW_SECONDS,
    ),
    ocr_languages=getenv("OCR_LANGUAGES", "").strip() or DEFAULT_OCR_LANGUAGES,
    # Off by default so the deployed service keeps the promise in the README
    # that file contents never reach the logs. Turn it on in staging for QA.
    log_error_detail=getenv("LOG_ERROR_DETAIL", "").strip().lower()
    in {"1", "true", "yes"},
)
