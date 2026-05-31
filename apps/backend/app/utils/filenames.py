import re
from pathlib import Path


def sanitize_filename(filename: str) -> str:
    basename = Path(filename).name
    sanitized = re.sub(r"[^A-Za-z0-9._-]+", "_", basename).strip("._")
    return sanitized or "upload"
