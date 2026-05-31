from dataclasses import dataclass
from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import UploadFile

from app.core.errors import (
    ChatReadyError,
    FRIENDLY_CONVERSION_ERROR,
    FRIENDLY_FILE_TOO_LARGE_ERROR,
)

CHUNK_SIZE_BYTES = 1024 * 1024


@dataclass(frozen=True)
class TemporaryUpload:
    path: Path
    size_bytes: int


async def save_upload_to_temp(
    upload: UploadFile,
    file_type: str,
    max_size_bytes: int,
    max_size_mb: int,
) -> TemporaryUpload:
    temp_file = NamedTemporaryFile(
        prefix="chatready_",
        suffix=f".{file_type}",
        delete=False,
    )
    temp_path = Path(temp_file.name)
    size_bytes = 0

    try:
        with temp_file:
            while True:
                chunk = await upload.read(CHUNK_SIZE_BYTES)

                if not chunk:
                    break

                size_bytes += len(chunk)

                if size_bytes > max_size_bytes:
                    raise ChatReadyError(
                        code="file_too_large",
                        message=FRIENDLY_FILE_TOO_LARGE_ERROR.format(
                            max_size_mb=max_size_mb
                        ),
                        status_code=413,
                    )

                temp_file.write(chunk)

        if size_bytes == 0:
            raise ChatReadyError(
                code="conversion_failed",
                message="Please upload a file with content.",
                status_code=400,
            )

        return TemporaryUpload(path=temp_path, size_bytes=size_bytes)

    except ChatReadyError:
        delete_temp_file(temp_path)
        raise
    except OSError as error:
        delete_temp_file(temp_path)
        raise ChatReadyError(
            code="conversion_failed",
            message=FRIENDLY_CONVERSION_ERROR,
            status_code=500,
        ) from error


def delete_temp_file(path: Path) -> None:
    try:
        path.unlink(missing_ok=True)
    except OSError:
        return
