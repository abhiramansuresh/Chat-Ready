from fastapi import APIRouter, File, UploadFile

from app.models.conversion import ConversionResponse, HealthResponse, UrlConversionRequest
from app.services.conversion import conversion_service

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.post("/convert", response_model=ConversionResponse)
async def convert_file(file: UploadFile = File(...)) -> ConversionResponse:
    return await conversion_service.convert_upload(file)


@router.post("/convert-url", response_model=ConversionResponse)
def convert_url(payload: UrlConversionRequest) -> ConversionResponse:
    return conversion_service.convert_url(payload.url)
