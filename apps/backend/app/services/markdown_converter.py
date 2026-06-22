from dataclasses import dataclass
import io
from pathlib import Path
import re
from time import perf_counter
from urllib.parse import parse_qs, urlparse
from warnings import catch_warnings, filterwarnings

import requests
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._transcripts import Transcript, TranscriptList

with catch_warnings():
    filterwarnings(
        "ignore",
        message="Couldn't find ffmpeg or avconv*",
        category=RuntimeWarning,
    )
    from markitdown import MarkItDown

from app.core.errors import (
    ChatReadyError,
    FRIENDLY_CONVERSION_ERROR,
    FRIENDLY_URL_ERROR,
    FRIENDLY_YOUTUBE_TRANSCRIPT_ERROR,
)

URL_FETCH_TIMEOUT_SECONDS = 15
YOUTUBE_VIDEO_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{6,}$")
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


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
        if path.suffix.lower() in IMAGE_EXTENSIONS:
            return self._convert_image(path, file_type)
        result = self._convert(source=path, file_type=file_type)
        if file_type == "pdf" and _is_scanned_pdf(result.markdown):
            return self._convert_scanned_pdf(path)
        return result

    def convert_url(self, url: str) -> ConvertedDocument:
        if _is_youtube_url(url):
            return self._convert_youtube(url)

        html = _fetch_url_html(url)
        if html is None:
            raise ChatReadyError(
                code="conversion_failed",
                message=FRIENDLY_URL_ERROR,
                status_code=422,
            )
        return self._convert(source=html, file_type="url")

    def _convert_scanned_pdf(self, path: Path) -> ConvertedDocument:
        started_at = perf_counter()

        try:
            from pdf2image import convert_from_path, pdfinfo_from_path
            import pytesseract
        except ImportError:
            raise ChatReadyError(
                code="unsupported_file",
                message=(
                    "This PDF appears to be scanned (no selectable text). "
                    "Converting scanned PDFs requires additional tools not available on this server."
                ),
                status_code=415,
            )

        try:
            info = pdfinfo_from_path(str(path))
            page_count = int(info.get("Pages", 0))
        except Exception:
            page_count = 99

        MAX_PAGES = 10
        pages_to_process = min(page_count, MAX_PAGES)
        pages_text: list[str] = []

        try:
            for page_num in range(1, pages_to_process + 1):
                # Load one page at a time — avoids holding all pages in RAM
                images = convert_from_path(
                    path,
                    dpi=100,
                    grayscale=True,
                    first_page=page_num,
                    last_page=page_num,
                )
                if images:
                    text = pytesseract.image_to_string(images[0]).strip()
                    if text:
                        pages_text.append(f"## Page {page_num}\n\n{text}")
                    del images  # free memory before next page
        except Exception as error:
            raise ChatReadyError(
                code="conversion_failed",
                message=FRIENDLY_CONVERSION_ERROR,
                status_code=500,
            ) from error

        if not pages_text:
            raise ChatReadyError(
                code="conversion_failed",
                message=(
                    "No text could be extracted from this scanned PDF. "
                    "The scan quality may be too low or the pages may contain no readable text."
                ),
                status_code=500,
            )

        truncation_note = (
            f"\n\n---\n_Note: Only the first {MAX_PAGES} of {page_count} pages were processed._"
            if page_count > MAX_PAGES
            else ""
        )
        ocr_text = "\n\n".join(pages_text)
        markdown = f"<!-- Extracted via OCR (scanned PDF) -->\n\n{ocr_text}{truncation_note}"
        processing_time_ms = round((perf_counter() - started_at) * 1000)

        return ConvertedDocument(
            markdown=markdown,
            raw_text=ocr_text,
            file_type="pdf",
            processing_time_ms=processing_time_ms,
        )

    def _convert_image(self, path: Path, file_type: str) -> ConvertedDocument:
        started_at = perf_counter()

        try:
            import pytesseract
            from PIL import Image

            image = Image.open(path)
            ocr_text = pytesseract.image_to_string(image).strip()
        except ImportError:
            raise ChatReadyError(
                code="unsupported_file",
                message=(
                    "Image conversion requires Tesseract OCR, which is not installed "
                    "on this server. Please convert your image to a PDF or text file first."
                ),
                status_code=415,
            )
        except Exception as error:
            raise ChatReadyError(
                code="conversion_failed",
                message=FRIENDLY_CONVERSION_ERROR,
                status_code=500,
            ) from error

        if not ocr_text:
            raise ChatReadyError(
                code="conversion_failed",
                message=(
                    "No text could be extracted from this image. "
                    "The image may contain no readable text, or the text may be too small or low contrast."
                ),
                status_code=500,
            )

        processing_time_ms = round((perf_counter() - started_at) * 1000)
        markdown = f"<!-- Extracted via OCR -->\n\n{ocr_text}"

        return ConvertedDocument(
            markdown=markdown,
            raw_text=ocr_text,
            file_type=file_type,
            processing_time_ms=processing_time_ms,
        )

    def _convert(
        self,
        source: str | Path,
        file_type: str,
    ) -> ConvertedDocument:
        started_at = perf_counter()

        try:
            if isinstance(source, str):
                # source is raw HTML content — pass as a stream so MarkItDown
                # parses it directly without making any network requests
                stream = io.BytesIO(source.encode("utf-8"))
                result = self._converter.convert(stream, file_extension=".html")
            else:
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

    def _convert_youtube(self, url: str) -> ConvertedDocument:
        video_id = _extract_youtube_video_id(url)

        if video_id is None:
            raise ChatReadyError(
                code="unsupported_url",
                message=FRIENDLY_URL_ERROR,
                status_code=400,
            )

        started_at = perf_counter()

        try:
            transcript_text = _fetch_youtube_transcript_text(video_id)
        except Exception as error:
            raise ChatReadyError(
                code="youtube_transcript_unavailable",
                message=FRIENDLY_YOUTUBE_TRANSCRIPT_ERROR,
                status_code=422,
            ) from error

        raw_text = _fetch_url_html(url) or transcript_text
        processing_time_ms = round((perf_counter() - started_at) * 1000)
        markdown = (
            "# YouTube transcript\n\n"
            f"Source: {url}\n\n"
            f"{transcript_text}"
        ).strip()

        return ConvertedDocument(
            markdown=markdown,
            raw_text=raw_text,
            file_type="youtube",
            processing_time_ms=processing_time_ms,
        )


def _is_scanned_pdf(markdown: str) -> bool:
    """Returns True if a PDF's extracted text looks like a scanned document
    (i.e. only page numbers were found, no real content)."""
    lines = [line.strip() for line in markdown.split("\n") if line.strip()]
    non_numeric = [line for line in lines if not line.isdigit()]
    if not lines:
        return True
    # If over 60% of lines are just page numbers, it's scanned
    if len(non_numeric) / len(lines) < 0.4:
        return True
    # Or if total meaningful word count is suspiciously low
    word_count = len(markdown.split())
    if word_count < 30:
        return True
    return False


def _fetch_url_html(url: str) -> str | None:
    try:
        response = requests.get(
            url,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (compatible; ChatReady/1.0; "
                    "+https://github.com/abhiramansuresh/Chat-Ready)"
                ),
                "Accept": "text/html,application/xhtml+xml,*/*;q=0.9",
                "Accept-Language": "en-US,en;q=0.9",
            },
            timeout=URL_FETCH_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
    except requests.RequestException:
        return None

    source_text = response.text.strip()
    return source_text if source_text else None


def _is_youtube_url(url: str) -> bool:
    parsed_url = urlparse(url)
    hostname = _normalized_hostname(parsed_url.netloc)

    return hostname == "youtu.be" or hostname == "youtube.com"


def _extract_youtube_video_id(url: str) -> str | None:
    parsed_url = urlparse(url)
    hostname = _normalized_hostname(parsed_url.netloc)
    path_parts = [part for part in parsed_url.path.split("/") if part]
    candidate: str | None = None

    if hostname == "youtu.be" and path_parts:
        candidate = path_parts[0]
    elif hostname == "youtube.com" and parsed_url.path == "/watch":
        candidate = parse_qs(parsed_url.query).get("v", [None])[0]
    elif hostname == "youtube.com" and path_parts:
        if path_parts[0] in {"embed", "live", "shorts"} and len(path_parts) > 1:
            candidate = path_parts[1]

    if candidate and YOUTUBE_VIDEO_ID_PATTERN.match(candidate):
        return candidate

    return None


def _normalized_hostname(netloc: str) -> str:
    hostname = netloc.lower().split(":")[0]

    for prefix in ("www.", "m.", "music."):
        if hostname.startswith(prefix):
            return hostname.removeprefix(prefix)

    return hostname


def _fetch_youtube_transcript_text(video_id: str) -> str:
    transcript_api = YouTubeTranscriptApi()
    transcript_list = transcript_api.list(video_id)
    transcript = _select_transcript(transcript_list)
    fetched_transcript = transcript.fetch()
    transcript_lines = [
        snippet.text.strip()
        for snippet in fetched_transcript
        if snippet.text.strip()
    ]
    transcript_text = "\n".join(transcript_lines).strip()

    if not transcript_text:
        raise ValueError("YouTube transcript was empty.")

    return transcript_text


def _select_transcript(transcript_list: TranscriptList) -> Transcript:
    try:
        return transcript_list.find_transcript(["en"])
    except Exception:
        for transcript in transcript_list:
            return transcript

    raise ValueError("No transcript is available.")
