from dataclasses import dataclass
from pathlib import Path
from time import perf_counter
from warnings import catch_warnings, filterwarnings

with catch_warnings():
    filterwarnings(
        "ignore",
        message="Couldn't find ffmpeg or avconv*",
        category=RuntimeWarning,
    )
    from markitdown import MarkItDown

from app.core.errors import ChatReadyError, FRIENDLY_CONVERSION_ERROR


@dataclass(frozen=True)
class ConvertedDocument:
    markdown: str
    raw_text: str
    file_type: str
    processing_time_ms: int


class MarkdownConverter:
    def __init__(self) -> None:
        self._converter = MarkItDown()

    def convert_file(self, path: Path, file_type: str) -> ConvertedDocument:
        return self._convert(source=path, file_type=file_type)

    def convert_url(self, url: str) -> ConvertedDocument:
        return self._convert(source=url, file_type="url")

    def _convert(self, source: str | Path, file_type: str) -> ConvertedDocument:
        started_at = perf_counter()

        try:
            result = self._converter.convert(source)
        except Exception as error:
            raise ChatReadyError(
                code="conversion_failed",
                message=FRIENDLY_CONVERSION_ERROR,
                status_code=500,
            ) from error

        processing_time_ms = round((perf_counter() - started_at) * 1000)
        markdown = (result.markdown or result.text_content or "").strip()
        raw_text = (result.text_content or markdown).strip()

        if not markdown:
            raise ChatReadyError(
                code="conversion_failed",
                message=FRIENDLY_CONVERSION_ERROR,
                status_code=500,
            )

        return ConvertedDocument(
            markdown=markdown,
            raw_text=raw_text,
            file_type=file_type,
            processing_time_ms=processing_time_ms,
        )
