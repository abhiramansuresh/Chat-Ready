"use client";

import type { ReactElement } from "react";
import { useState } from "react";

import type { ConversionResponse } from "@/types/conversion";

import {
  downloadMarkdownFile,
  formatNumber,
  getSavingsLabel,
} from "./downloads";

interface ResultsPanelProps {
  readonly result: ConversionResponse;
  readonly sourceLabel: string;
  readonly onReset: () => void;
}

export function ResultsPanel({
  result,
  sourceLabel,
  onReset,
}: ResultsPanelProps): ReactElement {
  const [copyLabel, setCopyLabel] = useState("Copy Markdown");
  const previewText =
    result.markdown.trim() || "No Markdown content was generated.";

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopyLabel("Copied ✓");
      window.setTimeout(() => setCopyLabel("Copy Markdown"), 2000);
    } catch {
      setCopyLabel("Copy failed");
      window.setTimeout(() => setCopyLabel("Copy Markdown"), 2000);
    }
  }

  function handleDownload(): void {
    downloadMarkdownFile({
      markdown: result.markdown,
      sourceLabel,
    });
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Markdown preview
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-teal-700 dark:text-teal-300">
              {getSavingsLabel(result)}
            </h2>
            <Tooltip result={result} />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleCopy}
            aria-live="polite"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:focus:ring-white dark:focus:ring-offset-slate-950"
          >
            {copyLabel}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-500 dark:focus:ring-white dark:focus:ring-offset-slate-950"
          >
            Download .md
          </button>
        </div>
      </div>

      <div className="py-5">
        <pre className="max-h-[260px] overflow-auto rounded-md border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100 sm:max-h-[360px] dark:border-slate-800">
          <code>{previewText}</code>
        </pre>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="inline-flex min-h-10 items-center justify-center rounded-md px-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:text-slate-300 dark:hover:text-white dark:focus:ring-white dark:focus:ring-offset-slate-950"
      >
        ← Convert another file
      </button>
    </div>
  );
}

interface TooltipProps {
  readonly result: ConversionResponse;
}

function Tooltip({ result }: TooltipProps): ReactElement {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label="How token savings are estimated"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-sm font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:focus:ring-white dark:focus:ring-offset-slate-950"
      >
        i
      </button>
      <span className="pointer-events-none absolute left-1/2 top-9 z-20 w-64 -translate-x-1/2 rounded-md bg-slate-950 px-3 py-2 text-left text-xs font-medium leading-5 text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-white dark:text-slate-950">
        Approximate estimate. Original: ~{formatNumber(result.rawTokenCount)}
        {" "}tokens. Markdown: ~{formatNumber(result.markdownTokenCount)}
        {" "}tokens. Actual savings vary by model.
      </span>
    </span>
  );
}
