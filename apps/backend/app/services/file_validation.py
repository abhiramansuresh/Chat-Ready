from dataclasses import dataclass
from pathlib import Path

from app.core.errors import ChatReadyError, FRIENDLY_UNSUPPORTED_FILE_ERROR
from app.utils.filenames import sanitize_filename

GENERIC_CONTENT_TYPES = {
    "",
    "application/octet-stream",
    "binary/octet-stream",
}

SUPPORTED_CONTENT_TYPES_BY_EXTENSION = {
    "pdf": {"application/pdf"},
    "docx": {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    },
    "txt": {"text/plain"},
    "md": {"text/markdown", "text/x-markdown", "text/plain"},
    "rtf": {"application/rtf", "application/x-rtf", "text/rtf"},
    "pptx": {
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    },
    "xlsx": {
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    },
    "csv": {"application/csv", "application/vnd.ms-excel", "text/csv", "text/plain"},
    "json": {"application/json", "text/json", "text/plain"},
    "xml": {"application/xml", "application/xhtml+xml", "text/plain", "text/xml"},
    "html": {"application/xhtml+xml", "text/html", "text/plain"},
    "png": {"image/png"},
    "jpg": {"image/jpeg"},
    "jpeg": {"image/jpeg"},
    "webp": {"image/webp"},
}


@dataclass(frozen=True)
class UploadValidationResult:
    file_type: str


def validate_upload(
    filename: str | None,
    content_type: str | None,
) -> UploadValidationResult:
    if filename is None:
        raise _unsupported_file_error()

    sanitized_filename = sanitize_filename(filename)
    extension = Path(sanitized_filename).suffix.lower().lstrip(".")

    if extension not in SUPPORTED_CONTENT_TYPES_BY_EXTENSION:
        raise _unsupported_file_error()

    normalized_content_type = _normalize_content_type(content_type)

    if normalized_content_type in GENERIC_CONTENT_TYPES:
        return UploadValidationResult(file_type=extension)

    allowed_content_types = SUPPORTED_CONTENT_TYPES_BY_EXTENSION[extension]

    if normalized_content_type not in allowed_content_types:
        raise _unsupported_file_error()

    return UploadValidationResult(file_type=extension)


def _normalize_content_type(content_type: str | None) -> str:
    if content_type is None:
        return ""

    return content_type.split(";", maxsplit=1)[0].strip().lower()


def _unsupported_file_error() -> ChatReadyError:
    return ChatReadyError(
        code="unsupported_file",
        message=FRIENDLY_UNSUPPORTED_FILE_ERROR,
        status_code=415,
    )
