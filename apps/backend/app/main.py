from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import JSONResponse

from app.api.routes import router
from app.core.config import settings
from app.core.errors import ChatReadyError, FRIENDLY_CONVERSION_ERROR
from app.core.rate_limit import RateLimitMiddleware


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.allowed_origins),
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(
        RateLimitMiddleware,
        request_limit=settings.rate_limit_requests,
        window_seconds=settings.rate_limit_window_seconds,
    )

    app.include_router(router)

    @app.exception_handler(ChatReadyError)
    async def chatready_error_handler(
        _request: Request,
        error: ChatReadyError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=error.status_code,
            content={
                "success": False,
                "error": {
                    "code": error.code,
                    "message": error.message,
                },
            },
        )

    @app.exception_handler(RequestValidationError)
    async def request_validation_error_handler(
        _request: Request,
        _error: RequestValidationError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "error": {
                    "code": "invalid_request",
                    "message": "Please check your request and try again.",
                },
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        _request: Request,
        error: StarletteHTTPException,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=error.status_code,
            content={
                "success": False,
                "error": {
                    "code": "invalid_request",
                    "message": "Please check your request and try again.",
                },
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_error_handler(
        _request: Request,
        _error: Exception,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "conversion_failed",
                    "message": FRIENDLY_CONVERSION_ERROR,
                },
            },
        )

    return app


app = create_app()
