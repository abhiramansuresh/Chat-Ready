"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";

import { ApiRequestError, convertFile, convertUrl } from "@/lib/api";
import { maxUploadSizeBytes, maxUploadSizeMb } from "@/lib/env";
import type { ConversionResponse } from "@/types/conversion";

import { ErrorState } from "./ErrorState";
import { FileDropZone, SupportedFormats } from "./FileDropZone";
import { LoadingState } from "./LoadingState";
import { mergeIntoQueue } from "./queue";
import { ResultsPanel } from "./ResultsPanel";
import {
  SessionHistory,
  type SessionHistoryItem,
} from "./SessionHistory";
import { UrlInput } from "./UrlInput";

type UploadStatus = "idle" | "loading" | "success" | "error";

interface QueueProgress {
  readonly current: number;
  readonly total: number;
  readonly fileName: string;
}

export function UploadArea(): ReactElement {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [queue, setQueue] = useState<readonly File[]>([]);
  const [queueNotice, setQueueNotice] = useState<string | null>(null);
  const [progress, setProgress] = useState<QueueProgress | null>(null);
  const [urlValue, setUrlValue] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<SessionHistoryItem | null>(null);
  const [failedNames, setFailedNames] = useState<readonly string[]>([]);
  const [convertedCount, setConvertedCount] = useState(0);
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>([]);
  const [pageDragDepth, setPageDragDepth] = useState(0);

  const isLoading = status === "loading";
  const showPageDropOverlay = pageDragDepth > 0 && !isLoading;

  useEffect(() => {
    function handleWindowDragEnter(event: DragEvent): void {
      if (!hasDraggedFiles(event) || isLoading) {
        return;
      }

      event.preventDefault();
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

      const dropped = Array.from(event.dataTransfer?.files ?? []);

      if (dropped.length > 0) {
        handleFilesSelected(dropped);
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
    // `queue` is read by the drop handler through handleFilesSelected, so the
    // listeners have to be rebound when it changes or drops land on stale state.
  }, [isLoading, queue]);

  function handleFilesSelected(incoming: readonly File[]): void {
    setPageDragDepth(0);
    setUrlError(null);

    const { files, notice } = mergeIntoQueue(queue, incoming, maxUploadSizeBytes);

    setQueue(files);
    setQueueNotice(notice);
    setStatus("idle");
    setErrorMessage(null);
  }

  function handleRemoveFile(index: number): void {
    setQueue((current) => current.filter((_, position) => position !== index));
    setQueueNotice(null);
  }

  async function handleConvertQueue(): Promise<void> {
    if (queue.length === 0 || isLoading) {
      return;
    }

    const files = queue;

    setStatus("loading");
    setErrorMessage(null);
    setQueueNotice(null);

    const converted: SessionHistoryItem[] = [];
    const failures: string[] = [];
    let lastError: unknown = null;

    // Strictly sequential: the free host runs one small worker, so overlapping
    // uploads would queue behind each other anyway and risk the 2 minute abort.
    for (const [index, file] of files.entries()) {
      setProgress({ current: index + 1, total: files.length, fileName: file.name });

      try {
        const result = await convertFile(file);
        converted.push(createHistoryItem(result, file.name, file.size));
      } catch (error) {
        failures.push(file.name);
        lastError = error;

        // Nothing left to gain from the remaining files, and hammering a
        // rate-limited server only digs the hole deeper.
        if (error instanceof ApiRequestError && error.code === "rate_limit_exceeded") {
          break;
        }
      }
    }

    setProgress(null);

    if (converted.length === 0) {
      // Queue is kept so "Try again" retries the same files.
      setStatus("error");
      setErrorMessage(getFriendlyError(lastError));
      return;
    }

    setQueue([]);
    setFailedNames(failures);
    setConvertedCount(converted.length);
    setActiveResult(converted[converted.length - 1]);
    setSessionHistory((current) => [...converted.slice().reverse(), ...current]);
    setStatus("success");
  }

  async function handleConvertUrl(): Promise<void> {
    const raw = urlValue.trim();
    const trimmedUrl = /^https?:\/\//i.test(raw) ? raw : raw ? `https://${raw}` : raw;

    if (isLoading) {
      return;
    }

    if (!isValidUrl(trimmedUrl)) {
      setUrlError("Enter a valid webpage URL.");
      return;
    }

    setStatus("loading");
    setUrlError(null);
    setErrorMessage(null);
    setQueue([]);
    setQueueNotice(null);

    try {
      const conversionResult = await convertUrl(trimmedUrl);
      const item = createHistoryItem(conversionResult, trimmedUrl);

      setFailedNames([]);
      setConvertedCount(1);
      setActiveResult(item);
      setSessionHistory((current) => [item, ...current]);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(getFriendlyError(error));
    }
  }

  function handleRetry(): void {
    if (queue.length > 0) {
      void handleConvertQueue();
      return;
    }

    void handleConvertUrl();
  }

  function handleReset(): void {
    setStatus("idle");
    setQueue([]);
    setQueueNotice(null);
    setUrlValue("");
    setUrlError(null);
    setErrorMessage(null);
    setActiveResult(null);
    setFailedNames([]);
    setConvertedCount(0);
    setPageDragDepth(0);
    scrollToUpload();
  }

  return (
    <div
      id="upload"
      className="w-full scroll-mt-24 transition-[max-width] duration-500 ease-in-out"
      style={{ maxWidth: status === "success" ? "56rem" : "42rem" }}
    >
      <section
        className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        aria-label="Convert your document to AI-ready Markdown"
        aria-busy={isLoading}
      >
        {showPageDropOverlay ? <PageDropOverlay /> : null}

        {status === "loading" ? (
          <LoadingState
            current={progress?.current}
            total={progress?.total}
            fileName={progress?.fileName}
          />
        ) : null}

        {status === "error" && errorMessage ? (
          <ErrorState
            message={errorMessage}
            onTryAgain={handleRetry}
            onReset={handleReset}
          />
        ) : null}

        {status === "success" && activeResult ? (
          <ResultsPanel
            result={activeResult.result}
            sourceLabel={activeResult.sourceLabel}
            originalFileSizeBytes={activeResult.originalSizeBytes}
            convertedCount={convertedCount}
            failedNames={failedNames}
            onReset={handleReset}
          />
        ) : null}

        {status === "idle" ? (
          <div className="flex flex-col gap-4">
            <FileDropZone
              disabled={isLoading}
              isDragActive={showPageDropOverlay}
              files={queue}
              notice={queueNotice}
              onClearAll={() => {
                setQueue([]);
                setQueueNotice(null);
              }}
              onClearFile={handleRemoveFile}
              onConvertFiles={handleConvertQueue}
              onFilesSelected={handleFilesSelected}
            />
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
            <SupportedFormats />
          </div>
        ) : null}
      </section>
      <SessionHistory
        activeId={status === "success" ? activeResult?.id ?? null : null}
        items={sessionHistory}
        onClearHistory={() => setSessionHistory([])}
        onSelect={(item) => {
          setStatus("success");
          setConvertedCount(1);
          setFailedNames([]);
          setActiveResult(item);
          scrollToUpload();
        }}
      />
    </div>
  );
}

/** After paint, so the panel has already resized to the new state. */
function scrollToUpload(): void {
  requestAnimationFrame(() => {
    document.getElementById("upload")?.scrollIntoView({ block: "start" });
  });
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

function createHistoryItem(
  result: ConversionResponse,
  sourceLabel: string,
  originalSizeBytes?: number,
): SessionHistoryItem {
  return {
    createdAtLabel: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date()),
    id: createHistoryId(),
    originalSizeBytes,
    result,
    sourceLabel,
  };
}

function createHistoryId(): string {
  if (globalThis.crypto.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
