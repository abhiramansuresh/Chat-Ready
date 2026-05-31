"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";

import { ApiRequestError, convertFile, convertUrl } from "@/lib/api";
import { maxUploadSizeBytes, maxUploadSizeMb } from "@/lib/env";
import type { ConversionResponse, ConversionStatus } from "@/types/conversion";

import { StatusMessage } from "./StatusMessage";
import { UploadDropzone } from "./UploadDropzone";
import { UrlInputForm } from "./UrlInputForm";

type InputMode = "file" | "url";

interface UploadPanelProps {
  readonly activeMode: InputMode;
  readonly resetKey: number;
  readonly onModeChange: (mode: InputMode) => void;
  readonly onConversionComplete: (result: ConversionResponse) => void;
}

export function UploadPanel({
  activeMode,
  resetKey,
  onModeChange,
  onConversionComplete,
}: UploadPanelProps): ReactElement {
  const [status, setStatus] = useState<ConversionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isBusy = status === "uploading" || status === "processing";
  const fileTabId = "converter-file-tab";
  const urlTabId = "converter-url-tab";
  const filePanelId = "converter-file-panel";
  const urlPanelId = "converter-url-panel";

  useEffect(() => {
    setStatus("idle");
    setErrorMessage(null);
  }, [resetKey]);

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
      const result = await conversionRequest;
      onConversionComplete(result);
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
      const result = await convertUrl(trimmedUrl);
      onConversionComplete(result);
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

  function handleModeChange(mode: InputMode): void {
    setErrorMessage(null);
    setStatus("idle");
    onModeChange(mode);
  }

  return (
    <section
      id="converter"
      className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      aria-label="Converter"
      aria-busy={isBusy}
    >
      <div
        className="mb-5 grid grid-cols-2 gap-2 rounded-md bg-slate-100 p-1"
        role="tablist"
        aria-label="Conversion input type"
      >
        <button
          id={fileTabId}
          type="button"
          role="tab"
          onClick={() => handleModeChange("file")}
          className={`min-h-10 rounded-md px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${
            activeMode === "file"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-600 hover:text-slate-950"
          }`}
          aria-selected={activeMode === "file"}
          aria-controls={filePanelId}
        >
          File
        </button>
        <button
          id={urlTabId}
          type="button"
          role="tab"
          onClick={() => handleModeChange("url")}
          className={`min-h-10 rounded-md px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${
            activeMode === "url"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-600 hover:text-slate-950"
          }`}
          aria-selected={activeMode === "url"}
          aria-controls={urlPanelId}
        >
          URL
        </button>
      </div>

      <div
        id={activeMode === "file" ? filePanelId : urlPanelId}
        role="tabpanel"
        aria-labelledby={activeMode === "file" ? fileTabId : urlTabId}
        className="flex flex-col gap-4"
      >
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
