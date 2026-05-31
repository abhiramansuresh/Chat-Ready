from collections import deque
from time import monotonic

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse
from starlette.types import ASGIApp


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app: ASGIApp,
        request_limit: int,
        window_seconds: int,
    ) -> None:
        super().__init__(app)
        self._request_limit = request_limit
        self._window_seconds = window_seconds
        self._requests_by_client: dict[str, deque[float]] = {}

    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        if request.url.path == "/health":
            return await call_next(request)

        client_id = self._get_client_id(request)
        now = monotonic()
        timestamps = self._requests_by_client.setdefault(client_id, deque())

        while timestamps and now - timestamps[0] > self._window_seconds:
            timestamps.popleft()

        if len(timestamps) >= self._request_limit:
            return JSONResponse(
                status_code=429,
                content={
                    "success": False,
                    "error": {
                        "code": "rate_limit_exceeded",
                        "message": "Too many requests. Please try again shortly.",
                    },
                },
            )

        timestamps.append(now)
        return await call_next(request)

    def _get_client_id(self, request: Request) -> str:
        forwarded_for = request.headers.get("x-forwarded-for")

        if forwarded_for:
            return forwarded_for.split(",")[0].strip()

        if request.client is None:
            return "unknown"

        return request.client.host
