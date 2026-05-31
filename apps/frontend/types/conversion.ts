export type ConversionStatus =
  | "idle"
  | "drag-hover"
  | "uploading"
  | "processing"
  | "success"
  | "error";

export interface ConversionResponse {
  success: true;
  markdown: string;
  rawTokenCount: number;
  markdownTokenCount: number;
  reductionPercent: number;
  fileType: string;
  processingTimeMs: number;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
}
