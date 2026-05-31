import type { ReactElement } from "react";

import type { ConversionStatus } from "@/types/conversion";

interface StatusMessageProps {
  readonly status: ConversionStatus;
  readonly errorMessage: string | null;
}

export function StatusMessage({
  status,
  errorMessage,
}: StatusMessageProps): ReactElement | null {
  if (status === "error" && errorMessage) {
    return (
      <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
        {errorMessage}
      </p>
    );
  }

  if (status === "uploading" || status === "processing") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="rounded-md bg-slate-100 px-4 py-3 text-sm text-slate-700"
      >
        Preparing your document...
      </p>
    );
  }

  if (status === "success") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="rounded-md bg-teal-50 px-4 py-3 text-sm text-teal-800"
      >
        Your Markdown is ready.
      </p>
    );
  }

  return null;
}
