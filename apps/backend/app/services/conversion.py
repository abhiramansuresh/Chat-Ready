import logging

from fastapi import UploadFile

from app.core.config import settings
from app.core.errors import ChatReadyError
from app.models.conversion import ConversionResponse
from app.services.file_validation import validate_upload
from app.services.markdown_converter import ConvertedDocument, MarkdownConverter
from app.services.temp_storage import delete_temp_file, save_upload_to_temp
from app.services.token_estimator import TokenEstimator, calculate_reduction_percent
from app.services.url_validation import validate_url

logger = logging.getLogger(__name__)


class ConversionService:
    def __init__(
        self,
        markdown_converter: MarkdownConverter,
        token_estimator: TokenEstimator,
    ) -> None:
        self._markdown_converter = markdown_converter
        self._token_estimator = token_estimator

    async def convert_upload(self, upload: UploadFile) -> ConversionResponse:
        validation = validate_upload(
            filename=upload.filename,
            content_type=upload.content_type,
        )
        temporary_upload = await save_upload_to_temp(
            upload=upload,
            file_type=validation.file_type,
            max_size_bytes=settings.max_upload_size_bytes,
            max_size_mb=settings.max_upload_size_mb,
        )

        try:
            converted_document = self._markdown_converter.convert_file(
                path=temporary_upload.path,
                file_type=validation.file_type,
            )
            response = self._build_response(converted_document)
            logger.info(
                "conversion succeeded file_type=%s duration_ms=%s",
                converted_document.file_type,
                converted_document.processing_time_ms,
            )
            return response
        except ChatReadyError:
            logger.info("conversion failed file_type=%s", validation.file_type)
            raise
        finally:
            delete_temp_file(temporary_upload.path)

    def convert_url(self, url: str) -> ConversionResponse:
        validated_url = validate_url(url)
        converted_document = self._markdown_converter.convert_url(validated_url)
        response = self._build_response(converted_document)
        logger.info(
            "conversion succeeded file_type=%s duration_ms=%s",
            converted_document.file_type,
            converted_document.processing_time_ms,
        )
        return response

    def _build_response(self, converted_document: ConvertedDocument) -> ConversionResponse:
        raw_token_count = self._token_estimator.estimate_tokens(
            converted_document.raw_text
        )
        markdown_token_count = self._token_estimator.estimate_tokens(
            converted_document.markdown
        )
        reduction_percent = calculate_reduction_percent(
            raw_token_count=raw_token_count,
            markdown_token_count=markdown_token_count,
        )

        return ConversionResponse(
            success=True,
            markdown=converted_document.markdown,
            rawTokenCount=raw_token_count,
            markdownTokenCount=markdown_token_count,
            reductionPercent=reduction_percent,
            fileType=converted_document.file_type,
            processingTimeMs=converted_document.processing_time_ms,
        )


conversion_service = ConversionService(
    markdown_converter=MarkdownConverter(),
    token_estimator=TokenEstimator(),
)
