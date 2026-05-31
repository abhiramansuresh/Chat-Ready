import { apiBaseUrl } from "@/lib/env";
import type { ApiErrorResponse, ConversionResponse } from "@/types/conversion";

const ERROR_MESSAGES: Record<string, string> = {
  conversion_failed: "Something went wrong while preparing your document.",
  file_too_large: "Please upload files smaller than 25MB.",
  invalid_request: "Please check your request and try again.",
  rate_limit_exceeded: "Too many requests. Please try again shortly.",
  unsupported_file: "That format is not supported yet.",
  unsupported_url: "Please enter a valid webpage or YouTube URL.",
};

const FALLBACK_ERROR_MESSAGE =
  "Something went wrong while preparing your document.";

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
    response = await fetch(`${apiBaseUrl}${path}`, init);
  } catch {
    throw new ApiRequestError("network_error", FALLBACK_ERROR_MESSAGE);
  }

  const responseBody = await readJson(response);

  if (!response.ok) {
    throw toApiError(responseBody);
  }

  if (isConversionResponse(responseBody)) {
    return responseBody;
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

function toApiError(responseBody: unknown): ApiRequestError {
  if (isApiErrorResponse(responseBody)) {
    const message = ERROR_MESSAGES[responseBody.error.code] ?? FALLBACK_ERROR_MESSAGE;
    return new ApiRequestError(responseBody.error.code, message);
  }

  return new ApiRequestError("unknown_error", FALLBACK_ERROR_MESSAGE);
}

function isConversionResponse(value: unknown): value is ConversionResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.success === true &&
    typeof value.markdown === "string" &&
    typeof value.rawTokenCount === "number" &&
    typeof value.markdownTokenCount === "number" &&
    typeof value.reductionPercent === "number" &&
    typeof value.fileType === "string" &&
    typeof value.processingTimeMs === "number"
  );
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
