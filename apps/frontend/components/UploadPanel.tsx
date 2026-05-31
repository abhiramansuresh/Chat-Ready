"use client";

import type { ReactElement } from "react";
import { useState } from "react";

import { ApiRequestError, convertFile, convertUrl } from "@/lib/api";
import { maxUploadSizeBytes, maxUploadSizeMb } from "@/lib/env";
import type { ConversionStatus } from "@/types/conversion";

import { StatusMessage } from "./StatusMessage";
import { UploadDropzone } from "./UploadDropzone";
import { UrlInputForm } from "./UrlInputForm";

type InputMode = "file" | "url";

interface UploadPanelProps {
  readonly activeMode: InputMode;
  readonly onModeChange: (mode: InputMode) => void;
}

export function UploadPanel({
  activeMode,
  onModeChange,
}: UploadPanelProps): ReactElement {
  const [status, setStatus] = useState<ConversionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isBusy = status === "uploading" || status === "processing";

  async function handleFileSelected(file: File): Promise<void> {
    if (file.size > maxUploadSizeBytes) {
      setStatus("error");
      setErrorMessage(`Please upload files smaller than ${maxUploadSizeMb}MB.`);
      return;
    }

    setStatus("uploading");
    setErrorMessage(null);

    try {
      const conversionRequest = convertFile(file);
      setStatus("processing");
      await conversionRequest;
      setStatus("success");
    } catch (error) {
      handleError(error);
    }
  }

  async function handleUrlSubmit(url: string): Promise<void> {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setStatus("error");
      setErrorMessage("Please enter a valid webpage or YouTube URL.");
      return;
    }

    setStatus("processing");
    setErrorMessage(null);

    try {
      await convertUrl(trimmedUrl);
      setStatus("success");
    } catch (error) {
      handleError(error);
    }
  }

  function handleError(error: unknown): void {
    const message =
      error instanceof ApiRequestError
        ? error.message
        : "Something went wrong while preparing your document.";

    setStatus("error");
    setErrorMessage(message);
  }

  function handleDragHover(): void {
    if (!isBusy) {
      setStatus("drag-hover");
    }
  }

  function handleDragIdle(): void {
    if (status === "drag-hover") {
      setStatus("idle");
    }
  }

  return (
    <section
      id="converter"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      aria-label="Converter"
    >
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-md bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => onModeChange("file")}
          className={`min-h-10 rounded-md px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${
            activeMode === "file"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-600 hover:text-slate-950"
          }`}
          aria-pressed={activeMode === "file"}
        >
          File
        </button>
        <button
          type="button"
          onClick={() => onModeChange("url")}
          className={`min-h-10 rounded-md px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${
            activeMode === "url"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-600 hover:text-slate-950"
          }`}
          aria-pressed={activeMode === "url"}
        >
          URL
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {activeMode === "file" ? (
          <UploadDropzone
            disabled={isBusy}
            status={status}
            onDragHover={handleDragHover}
            onDragIdle={handleDragIdle}
            onFileSelected={handleFileSelected}
          />
        ) : (
          <UrlInputForm disabled={isBusy} onSubmit={handleUrlSubmit} />
        )}

        <StatusMessage status={status} errorMessage={errorMessage} />
      </div>
    </section>
  );
}
