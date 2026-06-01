"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";

import { ApiRequestError, convertFile, convertUrl } from "@/lib/api";
import { maxUploadSizeBytes, maxUploadSizeMb } from "@/lib/env";
import type { ConversionResponse } from "@/types/conversion";

import { ErrorState } from "./ErrorState";
import { FileDropZone } from "./FileDropZone";
import { LoadingState } from "./LoadingState";
import { ResultsPanel } from "./ResultsPanel";
import {
  SessionHistory,
  type SessionHistoryItem,
} from "./SessionHistory";
import { UrlInput } from "./UrlInput";

type ActiveTab = "file" | "url";
type UploadStatus = "idle" | "loading" | "success" | "error";

export function UploadArea(): ReactElement {
  const [activeTab, setActiveTab] = useState<ActiveTab>("file");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlValue, setUrlValue] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResponse | null>(null);
  const [sourceLabel, setSourceLabel] = useState("chatready-output");
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>(
    [],
  );
  const [pageDragDepth, setPageDragDepth] = useState(0);

  const isLoading = status === "loading";
  const showPageDropOverlay = pageDragDepth > 0 && !isLoading;
  const fileTabId = "upload-area-file-tab";
  const urlTabId = "upload-area-url-tab";
  const filePanelId = "upload-area-file-panel";
  const urlPanelId = "upload-area-url-panel";

  useEffect(() => {
    function handleWindowDragEnter(event: DragEvent): void {
      if (!hasDraggedFiles(event) || isLoading) {
        return;
      }

      event.preventDefault();
      setActiveTab("file");
      setPageDragDepth((currentDepth) => currentDepth + 1);
    }

    function handleWindowDragOver(event: DragEvent): void {
      if (!hasDraggedFiles(event) || isLoading) {
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

      if (isLoading) {
        return;
      }

      const file = event.dataTransfer?.files.item(0);

      if (file) {
        handleFileSelected(file);
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
  }, [isLoading]);

  function handleTabChange(tab: ActiveTab): void {
    if (isLoading) {
      return;
    }

    setActiveTab(tab);
    setUrlError(null);
    setErrorMessage(null);
  }

  function handleFileSelected(file: File): void {
    setActiveTab("file");
    setResult(null);
    setUrlError(null);

    if (file.size > maxUploadSizeBytes) {
      setSelectedFile(null);
      setStatus("error");
      setErrorMessage(`File too large. Please upload a file under ${maxUploadSizeMb}MB.`);
      return;
    }

    setSelectedFile(file);
    setSourceLabel(file.name);
    setStatus("idle");
    setErrorMessage(null);
  }

  async function handleConvertFile(): Promise<void> {
    if (!selectedFile || isLoading) {
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const conversionResult = await convertFile(selectedFile);
      handleConversionSuccess(conversionResult, selectedFile.name);
    } catch (error) {
      setStatus("error");
      setErrorMessage(getFriendlyError(error));
    }
  }

  async function handleConvertUrl(): Promise<void> {
    const trimmedUrl = urlValue.trim();

    if (isLoading) {
      return;
    }

    if (!isValidUrl(trimmedUrl)) {
      setUrlError("Enter a valid webpage or YouTube URL.");
      return;
    }

    setStatus("loading");
    setUrlError(null);
    setErrorMessage(null);
    setSourceLabel(trimmedUrl);

    try {
      const conversionResult = await convertUrl(trimmedUrl);
      handleConversionSuccess(conversionResult, trimmedUrl);
    } catch (error) {
      setStatus("error");
      setErrorMessage(getFriendlyError(error));
    }
  }

  function handleReset(): void {
    setActiveTab("file");
    setStatus("idle");
    setSelectedFile(null);
    setUrlValue("");
    setUrlError(null);
    setErrorMessage(null);
    setResult(null);
    setSourceLabel("chatready-output");
    setPageDragDepth(0);
  }

  function handleConversionSuccess(
    conversionResult: ConversionResponse,
    label: string,
  ): void {
    setResult(conversionResult);
    setSourceLabel(label);
    setStatus("success");
    setSessionHistory((currentHistory) => [
      {
        createdAtLabel: new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date()),
        id: createHistoryId(),
        result: conversionResult,
        sourceLabel: label,
      },
      ...currentHistory,
    ]);
  }

  return (
    <div id="upload" className="mx-auto w-full max-w-4xl scroll-mt-24">
      <section
        className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition dark:border-slate-800 dark:bg-slate-900 sm:p-5"
        aria-label="Convert content to Markdown"
        aria-busy={isLoading}
      >
        {showPageDropOverlay ? <PageDropOverlay /> : null}

        {status === "loading" ? <LoadingState /> : null}

        {status === "error" && errorMessage ? (
          <ErrorState message={errorMessage} onTryAgain={handleReset} />
        ) : null}

        {status === "success" && result ? (
          <ResultsPanel
            result={result}
            sourceLabel={sourceLabel}
            onReset={handleReset}
          />
        ) : null}

        {status === "idle" ? (
          <>
            <div
              className="mb-5 grid grid-cols-2 gap-2 rounded-md bg-slate-100 p-1 dark:bg-slate-950"
              role="tablist"
              aria-label="Conversion input type"
            >
              <button
                id={fileTabId}
                type="button"
                role="tab"
                onClick={() => handleTabChange("file")}
                className={`min-h-11 rounded-md px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:focus:ring-white dark:focus:ring-offset-slate-950 ${
                  activeTab === "file"
                    ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                }`}
                aria-selected={activeTab === "file"}
                aria-controls={filePanelId}
              >
                File
              </button>
              <button
                id={urlTabId}
                type="button"
                role="tab"
                onClick={() => handleTabChange("url")}
                className={`min-h-11 rounded-md px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:focus:ring-white dark:focus:ring-offset-slate-950 ${
                  activeTab === "url"
                    ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                }`}
                aria-selected={activeTab === "url"}
                aria-controls={urlPanelId}
              >
                URL
              </button>
            </div>

            <div
              id={activeTab === "file" ? filePanelId : urlPanelId}
              role="tabpanel"
              aria-labelledby={activeTab === "file" ? fileTabId : urlTabId}
            >
              {activeTab === "file" ? (
                <FileDropZone
                  disabled={isLoading}
                  isDragActive={showPageDropOverlay}
                  selectedFile={selectedFile}
                  onClearFile={() => setSelectedFile(null)}
                  onConvertFile={handleConvertFile}
                  onFileSelected={handleFileSelected}
                />
              ) : (
                <UrlInput
                  disabled={isLoading}
                  value={urlValue}
                  errorMessage={urlError}
                  onChange={(value) => {
                    setUrlValue(value);
                    setUrlError(null);
                  }}
                  onConvert={handleConvertUrl}
                />
              )}
            </div>
          </>
        ) : null}
      </section>
      <SessionHistory
        items={sessionHistory}
        onClearHistory={() => setSessionHistory([])}
      />
    </div>
  );
}

function PageDropOverlay(): ReactElement {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-5"
      aria-hidden="true"
    >
      <div className="flex min-h-64 w-full max-w-2xl items-center justify-center rounded-xl border-2 border-dashed border-white px-6 text-center">
        <p className="text-3xl font-semibold text-white">
          Drop to convert
        </p>
      </div>
    </div>
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

function isValidUrl(value: string): boolean {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function getFriendlyError(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return "Conversion failed. This file type may not be supported.";
}

function createHistoryId(): string {
  if (globalThis.crypto.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
