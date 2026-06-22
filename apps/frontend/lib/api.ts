import { apiBaseUrl } from "@/lib/env";
import type { ApiErrorResponse, ConversionResponse } from "@/types/conversion";

const ERROR_MESSAGES: Record<string, string> = {
  conversion_failed: "Something went wrong while preparing your document.",
  file_too_large: "Please upload files smaller than 25MB.",
  invalid_request: "Please check the file or URL and try again.",
  rate_limit_exceeded: "You're converting too quickly. Please wait a moment.",
  unsupported_file: "That format is not supported yet.",
  unsupported_url: "Please enter a valid webpage or YouTube URL.",
  youtube_transcript_unavailable:
    "Could not convert this YouTube video. A public transcript may not be available.",
};

const FALLBACK_ERROR_MESSAGE =
  "Something went wrong while preparing your document.";
const NETWORK_ERROR_MESSAGE = "Could not reach the conversion service.";
const TIMEOUT_ERROR_MESSAGE =
  "Conversion is taking too long — this can happen with large scanned PDFs on the free server. Try a smaller file, or split a large PDF into sections before uploading.";

const REQUEST_TIMEOUT_MS = 120_000; // 2 minutes

export class ApiRequestError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
  }
}

export async function convertFile(file: File): Promise<ConversionResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return requestConversion("/convert", {
    method: "POST",
    body: formData,
  });
}

export async function convertUrl(url: string): Promise<ConversionResponse> {
  return requestConversion("/convert-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });
}

async function requestConversion(
  path: string,
  init: RequestInit,
): Promise<ConversionResponse> {
  let response: Response;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      response = await fetch(`${apiBaseUrl}${path}`, {
        ...init,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiRequestError("timeout", TIMEOUT_ERROR_MESSAGE);
    }
    throw new ApiRequestError("network_error", NETWORK_ERROR_MESSAGE);
  }

  const responseBody = await readJson(response);

  if (!response.ok) {
    throw toApiError(response.status, responseBody);
  }

  const conversionResponse = normalizeConversionResponse(responseBody);

  if (conversionResponse) {
    return conversionResponse;
  }

  throw new ApiRequestError("invalid_response", FALLBACK_ERROR_MESSAGE);
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function toApiError(status: number, responseBody: unknown): ApiRequestError {
  if (isApiErrorResponse(responseBody)) {
    const message = ERROR_MESSAGES[responseBody.error.code] ?? FALLBACK_ERROR_MESSAGE;
    return new ApiRequestError(responseBody.error.code, message);
  }

  if (status === 400) {
    return new ApiRequestError("invalid_request", ERROR_MESSAGES.invalid_request);
  }

  if (status === 413) {
    return new ApiRequestError("file_too_large", ERROR_MESSAGES.file_too_large);
  }

  if (status === 415) {
    return new ApiRequestError("unsupported_file", ERROR_MESSAGES.unsupported_file);
  }

  if (status === 429) {
    return new ApiRequestError(
      "rate_limit_exceeded",
      ERROR_MESSAGES.rate_limit_exceeded,
    );
  }

  return new ApiRequestError("unknown_error", FALLBACK_ERROR_MESSAGE);
}

function normalizeConversionResponse(value: unknown): ConversionResponse | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawTokenCount = readNumber(value, "rawTokenCount", "original_tokens");
  const markdownTokenCount = readNumber(
    value,
    "markdownTokenCount",
    "converted_tokens",
  );
  const reductionPercent = readNumber(
    value,
    "reductionPercent",
    "reduction_percentage",
  );

  if (
    typeof value.markdown !== "string" ||
    rawTokenCount === null ||
    markdownTokenCount === null ||
    reductionPercent === null
  ) {
    return null;
  }

  return {
    success: true,
    markdown: value.markdown,
    rawTokenCount,
    markdownTokenCount,
    reductionPercent,
    fileType: typeof value.fileType === "string" ? value.fileType : "md",
    processingTimeMs:
      typeof value.processingTimeMs === "number" ? value.processingTimeMs : 0,
  };
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!isRecord(value) || value.success !== false || !isRecord(value.error)) {
    return false;
  }

  return (
    typeof value.error.code === "string" &&
    typeof value.error.message === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNumber(
  value: Record<string, unknown>,
  camelCaseKey: string,
  snakeCaseKey: string,
): number | null {
  const candidate = value[camelCaseKey] ?? value[snakeCaseKey];

  return typeof candidate === "number" ? candidate : null;
}
