import tiktoken
from tiktoken.core import Encoding


class TokenEstimator:
    def __init__(self) -> None:
        self._encoding: Encoding | None = None

    def estimate_tokens(self, text: str) -> int:
        if not text:
            return 0

        return len(self._get_encoding().encode(text))

    def _get_encoding(self) -> Encoding:
        if self._encoding is None:
            self._encoding = tiktoken.get_encoding("cl100k_base")

        return self._encoding


def calculate_reduction_percent(raw_token_count: int, markdown_token_count: int) -> int:
    if raw_token_count <= 0:
        return 0

    reduction = ((raw_token_count - markdown_token_count) / raw_token_count) * 100
    return round(reduction)
