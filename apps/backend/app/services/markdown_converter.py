from dataclasses import dataclass
import io
from pathlib import Path
import re
import subprocess
import tempfile
from time import perf_counter
from urllib.parse import parse_qs, urljoin, urlparse
from warnings import catch_warnings, filterwarnings

import requests
from striprtf.striprtf import rtf_to_text
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
from app.services.text_cleanup import clean_page_text, normalize
from app.services.url_validation import require_public_url

URL_FETCH_TIMEOUT_SECONDS = 15
URL_MAX_REDIRECTS = 5
URL_MAX_RESPONSE_BYTES = 5 * 1024 * 1024
URL_ALLOWED_CONTENT_TYPE_PREFIXES = (
    "text/",
    "application/xhtml",
    "application/xml",
    "application/json",
)

YOUTUBE_VIDEO_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{6,}$")
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

# Formats whose source is text the user could have pasted directly. For these
# the raw file is the honest "before" for the token comparison. Binary formats
# are excluded: the token count of a zip archive means nothing, and the UI
# falls back to a file-size comparison for them.
MARKUP_FILE_TYPES = {"html", "xml"}

PDF_EXTRACT_TIMEOUT_SECONDS = 30
OCR_MAX_PAGES = 10
OCR_PAGE_TIMEOUT_SECONDS = 30
# Kept comfortably under the frontend's 120s abort so a slow scan returns the
# pages it managed to read instead of dying as a timeout with nothing to show.
OCR_TIME_BUDGET_SECONDS = 75
# 100 DPI measurably hurts Tesseract accuracy; 150 is the usual floor for clean
# text. ponytail: raise toward 300 if the host has memory to spare — cost is
# roughly quadratic in DPI, and this pipeline runs one page at a time.
OCR_RENDER_DPI = 150


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
        if file_type == "pdf":
            return self._convert_pdf(path)
        if file_type == "rtf":
            return self._convert_rtf(path)

        raw_text_override = (
            path.read_text(encoding="utf-8", errors="replace")
            if file_type in MARKUP_FILE_TYPES
            else None
        )

        return self._convert(
            source=path,
            file_type=file_type,
            raw_text_override=raw_text_override,
        )

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
        # The raw HTML is the honest "before": it is what the user would
        # otherwise be pasting into a chat window.
        return self._convert(source=html, file_type="url", raw_text_override=html)

    def _convert_pdf(self, path: Path) -> ConvertedDocument:
        """Read the PDF text layer with pdftotext, fall back to OCR if scanned."""
        started_at = perf_counter()
        extracted = _extract_pdf_text(path)

        if _is_scanned_pdf(extracted):
            return self._convert_scanned_pdf(path, started_at)

        markdown = clean_page_text(extracted.split("\f"))

        return ConvertedDocument(
            markdown=markdown,
            raw_text=extracted,
            file_type="pdf",
            processing_time_ms=_elapsed_ms(started_at),
        )

    def _convert_scanned_pdf(self, path: Path, started_at: float) -> ConvertedDocument:
        page_count = _pdf_page_count(path)
        page_limit = min(page_count, OCR_MAX_PAGES) if page_count else OCR_MAX_PAGES
        pages_text: list[str] = []
        pages_read = 0

        with tempfile.TemporaryDirectory() as tmpdir:
            for page_number in range(1, page_limit + 1):
                if perf_counter() - started_at > OCR_TIME_BUDGET_SECONDS:
                    break

                pages_read = page_number
                image_path = _render_pdf_page(path, page_number, tmpdir)

                if image_path is None:
                    continue

                text = _ocr_image(image_path)

                if text:
                    pages_text.append(text)

        if not pages_text:
            raise ChatReadyError(
                code="conversion_failed",
                message=(
                    "No text could be extracted from this scanned PDF. "
                    "The scan quality may be too low or the pages may contain no readable text."
                ),
                status_code=500,
            )

        ocr_text = clean_page_text(pages_text)
        note = _truncation_note(pages_read=pages_read, page_count=page_count)
        markdown = f"<!-- Extracted via OCR (scanned PDF) -->\n\n{ocr_text}{note}"

        return ConvertedDocument(
            markdown=markdown,
            raw_text="\n\n".join(pages_text),
            file_type="pdf",
            processing_time_ms=_elapsed_ms(started_at),
        )

    def _convert_image(self, path: Path, file_type: str) -> ConvertedDocument:
        started_at = perf_counter()

        try:
            result = subprocess.run(
                ["tesseract", str(path), "stdout", "-l", "eng"],
                capture_output=True,
                text=True,
                timeout=60,
            )
            raw_text = result.stdout
        except FileNotFoundError as error:
            raise ChatReadyError(
                code="unsupported_file",
                message=(
                    "Image conversion requires Tesseract OCR, which is not installed "
                    "on this server. Please convert your image to a PDF or text file first."
                ),
                status_code=415,
            ) from error
        except Exception as error:
            raise ChatReadyError(
                code="conversion_failed",
                message=FRIENDLY_CONVERSION_ERROR,
                status_code=500,
            ) from error

        ocr_text = clean_page_text([raw_text])

        if not ocr_text:
            raise ChatReadyError(
                code="conversion_failed",
                message=(
                    "No text could be extracted from this image. "
                    "The image may contain no readable text, or the text may be too small or low contrast."
                ),
                status_code=500,
            )

        return ConvertedDocument(
            markdown=f"<!-- Extracted via OCR -->\n\n{ocr_text}",
            raw_text=raw_text,
            file_type=file_type,
            processing_time_ms=_elapsed_ms(started_at),
        )

    def _convert_rtf(self, path: Path) -> ConvertedDocument:
        """MarkItDown has no RTF converter and silently passes the control codes
        through its plain-text fallback, so strip them here instead."""
        started_at = perf_counter()

        try:
            source = path.read_text(encoding="utf-8", errors="replace")
            markdown = normalize(rtf_to_text(source, errors="ignore"))
        except Exception as error:
            raise ChatReadyError(
                code="conversion_failed",
                message=FRIENDLY_CONVERSION_ERROR,
                status_code=500,
            ) from error

        if not markdown:
            raise ChatReadyError(
                code="conversion_failed",
                message=FRIENDLY_CONVERSION_ERROR,
                status_code=500,
            )

        return ConvertedDocument(
            markdown=markdown,
            raw_text=source,
            file_type="rtf",
            processing_time_ms=_elapsed_ms(started_at),
        )

    def _convert(
        self,
        source: str | Path,
        file_type: str,
        raw_text_override: str | None = None,
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

        markdown = normalize(result.markdown or result.text_content or "")
        raw_text = raw_text_override or result.text_content or markdown

        if not markdown:
            raise ChatReadyError(
                code="conversion_failed",
                message=FRIENDLY_CONVERSION_ERROR,
                status_code=500,
            )

        return ConvertedDocument(
            markdown=markdown,
            raw_text=raw_text.strip(),
            file_type=file_type,
            processing_time_ms=_elapsed_ms(started_at),
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

        markdown = normalize(
            f"# YouTube transcript\n\nSource: {url}\n\n{transcript_text}"
        )

        return ConvertedDocument(
            markdown=markdown,
            raw_text=transcript_text,
            file_type="youtube",
            processing_time_ms=_elapsed_ms(started_at),
        )


def _elapsed_ms(started_at: float) -> int:
    return round((perf_counter() - started_at) * 1000)


def _extract_pdf_text(path: Path) -> str:
    try:
        result = subprocess.run(
            ["pdftotext", "-layout", str(path), "-"],
            capture_output=True,
            text=True,
            timeout=PDF_EXTRACT_TIMEOUT_SECONDS,
        )
    except FileNotFoundError as error:
        # Missing poppler is a deploy problem, not a bad document — saying
        # "this scan is low quality" would send the user chasing the wrong fix.
        raise ChatReadyError(
            code="conversion_failed",
            message=(
                "PDF conversion is unavailable on this server because "
                "poppler-utils is not installed."
            ),
            status_code=500,
        ) from error
    except subprocess.SubprocessError:
        return ""

    return result.stdout


def _pdf_page_count(path: Path) -> int:
    """Returns 0 when the page count cannot be determined."""
    try:
        result = subprocess.run(
            ["pdfinfo", str(path)],
            capture_output=True,
            text=True,
            timeout=10,
        )
    except (OSError, subprocess.SubprocessError):
        return 0

    for line in result.stdout.splitlines():
        if line.lower().startswith("pages:"):
            try:
                return int(line.split(":", maxsplit=1)[1].strip())
            except ValueError:
                return 0

    return 0


def _render_pdf_page(path: Path, page_number: int, tmpdir: str) -> str | None:
    image_prefix = f"{tmpdir}/p{page_number}"

    try:
        subprocess.run(
            [
                "pdftoppm",
                "-gray", "-r", str(OCR_RENDER_DPI),
                "-f", str(page_number), "-l", str(page_number),
                "-singlefile",
                str(path), image_prefix,
            ],
            capture_output=True,
            timeout=OCR_PAGE_TIMEOUT_SECONDS,
            check=True,
        )
    except (OSError, subprocess.SubprocessError):
        return None

    # pdftoppm writes .pgm for -gray, but some builds emit .ppm instead.
    for suffix in (".pgm", ".ppm"):
        candidate = f"{image_prefix}{suffix}"
        if Path(candidate).exists():
            return candidate

    return None


def _ocr_image(image_path: str) -> str:
    try:
        result = subprocess.run(
            ["tesseract", image_path, "stdout", "-l", "eng"],
            capture_output=True,
            text=True,
            timeout=OCR_PAGE_TIMEOUT_SECONDS,
        )
    except (OSError, subprocess.SubprocessError):
        return ""

    return result.stdout.strip()


def _truncation_note(pages_read: int, page_count: int) -> str:
    if not page_count or pages_read >= page_count:
        return ""

    return (
        f"\n\n---\n_Note: only the first {pages_read} of {page_count} pages "
        "were processed._"
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
    current_url = url

    for _ in range(URL_MAX_REDIRECTS + 1):
        try:
            # Re-checked every hop: a public host is free to redirect into the
            # private network, which would defeat the check done at validation.
            require_public_url(current_url)
            response = requests.get(
                current_url,
                headers={
                    "User-Agent": (
                        "Mozilla/5.0 (compatible; ChatReady/1.0; "
                        "+https://github.com/abhiramansuresh/Chat-Ready)"
                    ),
                    "Accept": "text/html,application/xhtml+xml,*/*;q=0.9",
                    "Accept-Language": "en-US,en;q=0.9",
                },
                timeout=URL_FETCH_TIMEOUT_SECONDS,
                allow_redirects=False,
                stream=True,
            )
        except (requests.RequestException, ChatReadyError):
            return None

        with response:
            if response.is_redirect or response.is_permanent_redirect:
                location = response.headers.get("location")

                if not location:
                    return None

                current_url = urljoin(current_url, location)
                continue

            if not response.ok:
                return None

            if not _is_textual_response(response):
                return None

            source_text = _read_capped_text(response).strip()
            return source_text or None

    return None


def _is_textual_response(response: requests.Response) -> bool:
    content_type = (
        response.headers.get("content-type", "")
        .split(";", maxsplit=1)[0]
        .strip()
        .lower()
    )

    if not content_type:
        return True

    return content_type.startswith(URL_ALLOWED_CONTENT_TYPE_PREFIXES)


def _read_capped_text(response: requests.Response) -> str:
    """Reads at most URL_MAX_RESPONSE_BYTES so a huge page cannot exhaust memory."""
    chunks: list[bytes] = []
    total_bytes = 0

    for chunk in response.iter_content(chunk_size=64 * 1024):
        chunks.append(chunk)
        total_bytes += len(chunk)

        if total_bytes >= URL_MAX_RESPONSE_BYTES:
            break

    body = b"".join(chunks)[:URL_MAX_RESPONSE_BYTES]
    encoding = response.encoding or response.apparent_encoding or "utf-8"

    return body.decode(encoding, errors="replace")


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
