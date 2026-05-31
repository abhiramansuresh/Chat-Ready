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
  const [pageDragDepth, setPageDragDepth] = useState(0);

  const isBusy = status === "uploading" || status === "processing";
  const showPageDropOverlay = pageDragDepth > 0 && !isBusy;
  const fileTabId = "converter-file-tab";
  const urlTabId = "converter-url-tab";
  const filePanelId = "converter-file-panel";
  const urlPanelId = "converter-url-panel";

  useEffect(() => {
    setStatus("idle");
    setErrorMessage(null);
  }, [resetKey]);

  useEffect(() => {
    function handleWindowDragEnter(event: DragEvent): void {
      if (!hasDraggedFiles(event) || isBusy) {
        return;
      }

      event.preventDefault();
      setPageDragDepth((currentDepth) => currentDepth + 1);

      if (activeMode !== "file") {
        onModeChange("file");
      }
    }

    function handleWindowDragOver(event: DragEvent): void {
      if (!hasDraggedFiles(event) || isBusy) {
        return;
      }

      event.preventDefault();

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "copy";
      }
    }

    function handleWindowDragLeave(event: DragEvent): void {
      if (!hasDraggedFiles(event)) {
        return;
      }

      event.preventDefault();
      setPageDragDepth((currentDepth) => Math.max(currentDepth - 1, 0));
    }

    function handleWindowDrop(event: DragEvent): void {
      if (!hasDraggedFiles(event)) {
        return;
      }

      event.preventDefault();
      setPageDragDepth(0);

      if (isBusy) {
        return;
      }

      const file = event.dataTransfer?.files.item(0);

      if (file) {
        onModeChange("file");
        void handleFileSelected(file);
      }
    }

    window.addEventListener("dragenter", handleWindowDragEnter);
    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("dragleave", handleWindowDragLeave);
    window.addEventListener("drop", handleWindowDrop);

    return () => {
      window.removeEventListener("dragenter", handleWindowDragEnter);
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("dragleave", handleWindowDragLeave);
      window.removeEventListener("drop", handleWindowDrop);
    };
  }, [activeMode, isBusy, onModeChange]);

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
      className="relative min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      aria-label="Converter"
      aria-busy={isBusy}
    >
      {showPageDropOverlay ? (
        <div
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-6"
          aria-hidden="true"
        >
          <div className="flex min-h-64 w-full max-w-2xl items-center justify-center rounded-lg border-2 border-dashed border-white bg-white/95 px-6 text-center shadow-xl">
            <p className="text-2xl font-semibold text-slate-950">
              Drop your file to convert it
            </p>
          </div>
        </div>
      ) : null}
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
        className="flex min-h-[22.25rem] flex-col gap-4"
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

        <div className="min-h-11">
          <StatusMessage status={status} errorMessage={errorMessage} />
        </div>
      </div>
    </section>
  );
}

function hasDraggedFiles(event: DragEvent): boolean {
  const types = event.dataTransfer?.types;

  if (!types) {
    return false;
  }

  for (let index = 0; index < types.length; index += 1) {
    if (types[index] === "Files") {
      return true;
    }
  }

  return false;
}
