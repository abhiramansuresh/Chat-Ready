from dataclasses import dataclass


FRIENDLY_CONVERSION_ERROR = "Something went wrong while preparing your document."
FRIENDLY_FILE_TOO_LARGE_ERROR = "Please upload files smaller than {max_size_mb}MB."
FRIENDLY_UNSUPPORTED_FILE_ERROR = "That format is not supported yet."
FRIENDLY_URL_ERROR = "Please enter a valid webpage or YouTube URL."
FRIENDLY_YOUTUBE_TRANSCRIPT_ERROR = (
    "Could not convert this YouTube video. A public transcript may not be available."
)


@dataclass(frozen=True)
class ChatReadyError(Exception):
    code: str
    message: str
    status_code: int
