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
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-3xl font-semibold tracking-tight text-teal-700 dark:text-teal-300">
            {getSavingsLabel(result)}
          </h2>
          <Tooltip />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Original" value={`~${formatNumber(result.rawTokenCount)} tokens`} />
          <Stat
            label="Converted"
            value={`~${formatNumber(result.markdownTokenCount)} tokens`}
          />
        </div>
      </div>

      <div className="py-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Markdown preview
        </p>
        <pre className="max-h-[260px] overflow-auto rounded-md border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100 sm:max-h-[360px] dark:border-slate-800">
          <code>{previewText}</code>
        </pre>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleCopy}
          aria-live="polite"
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:focus:ring-white dark:focus:ring-offset-slate-950"
        >
          {copyLabel}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-500 dark:focus:ring-white dark:focus:ring-offset-slate-950"
        >
          Download .md
        </button>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md px-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:text-slate-300 dark:hover:text-white dark:focus:ring-white dark:focus:ring-offset-slate-950"
      >
        ← Convert another file
      </button>
    </div>
  );
}

interface StatProps {
  readonly label: string;
  readonly value: string;
}

function Stat({ label, value }: StatProps): ReactElement {
  return (
    <div className="rounded-md bg-slate-50 px-4 py-3 dark:bg-slate-950">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function Tooltip(): ReactElement {
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
        Estimated using cl100k_base tokenizer (GPT-4 / Claude compatible).
        Actual savings vary by model.
      </span>
    </span>
  );
}
