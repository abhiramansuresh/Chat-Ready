const DEFAULT_API_BASE_URL = "http://localhost:8000";
const DEFAULT_MAX_UPLOAD_SIZE_MB = 25;

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_BASE_URL;

export const maxUploadSizeMb = readPositiveNumber(
  process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB,
  DEFAULT_MAX_UPLOAD_SIZE_MB,
);

export const maxUploadSizeBytes = maxUploadSizeMb * 1024 * 1024;

function readPositiveNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
}
