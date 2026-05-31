from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ConversionResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    success: Literal[True]
    markdown: str
    raw_token_count: int = Field(alias="rawTokenCount")
    markdown_token_count: int = Field(alias="markdownTokenCount")
    reduction_percent: int = Field(alias="reductionPercent")
    file_type: str = Field(alias="fileType")
    processing_time_ms: int = Field(alias="processingTimeMs")


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    success: Literal[False]
    error: ErrorDetail


class HealthResponse(BaseModel):
    status: Literal["ok"]


class UrlConversionRequest(BaseModel):
    url: str
