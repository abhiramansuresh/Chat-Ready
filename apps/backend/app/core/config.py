from dataclasses import dataclass
from os import getenv
from pathlib import Path

from dotenv import load_dotenv

BACKEND_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_ALLOWED_ORIGINS = ("http://localhost:3000",)
DEFAULT_MAX_UPLOAD_SIZE_MB = 25

load_dotenv(BACKEND_ROOT / ".env")


def _read_allowed_origins() -> tuple[str, ...]:
    value = getenv("ALLOWED_ORIGINS")

    if value is None:
        return DEFAULT_ALLOWED_ORIGINS

    origins = tuple(origin.strip() for origin in value.split(",") if origin.strip())
    return origins or DEFAULT_ALLOWED_ORIGINS


def _read_max_upload_size_mb() -> int:
    value = getenv("MAX_UPLOAD_SIZE_MB")

    if value is None:
        return DEFAULT_MAX_UPLOAD_SIZE_MB

    try:
        parsed_value = int(value)
    except ValueError:
        return DEFAULT_MAX_UPLOAD_SIZE_MB

    if parsed_value <= 0:
        return DEFAULT_MAX_UPLOAD_SIZE_MB

    return parsed_value


@dataclass(frozen=True)
class Settings:
    app_name: str
    environment: str
    allowed_origins: tuple[str, ...]
    max_upload_size_mb: int

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


settings = Settings(
    app_name="ChatReady API",
    environment=getenv("ENVIRONMENT", "development"),
    allowed_origins=_read_allowed_origins(),
    max_upload_size_mb=_read_max_upload_size_mb(),
)
