"use client";

import type { ReactElement } from "react";
import { useState } from "react";

import type { ConversionResponse } from "@/types/conversion";

import {
  downloadMarkdownFile,
  formatNumber,
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
  const [copyLabel, setCopyLabel] = useState<"copy" | "copied" | "failed">("copy");
  const previewText = result.markdown.trim() || "No content was extracted.";

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopyLabel("copied");
      window.setTimeout(() => setCopyLabel("copy"), 2500);
    } catch {
      setCopyLabel("failed");
      window.setTimeout(() => setCopyLabel("copy"), 2500);
    }
  }

  function handleDownload(): void {
    downloadMarkdownFile({ markdown: result.markdown, sourceLabel });
  }

  const hasReduction = result.reductionPercent > 5;

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Success header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
            <CheckIcon />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
              Ready for AI
            </p>
            <h2 className="mt-0.5 text-xl font-bold text-slate-950 dark:text-white">
              {hasReduction
                ? `~${Math.round(result.reductionPercent)}% less data for AI to process`
                : "Your document is converted"}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {hasReduction
                ? "Formatting and markup were stripped — the AI sees only clean, structured text."
                : "The content has been converted to Markdown — the format AI tools read most accurately."}
            </p>
          </div>
        </div>

        {/* Token stats */}
        <div className="flex shrink-0 gap-3 text-center sm:flex-col sm:gap-1">
          <StatChip label="Before" value={`~${formatNumber(result.rawTokenCount)} tokens`} />
          <StatChip label="After" value={`~${formatNumber(result.markdownTokenCount)} tokens`} muted={!hasReduction} />
        </div>
      </div>

      {/* "What to do next" guidance */}
      <div className="flex items-start gap-3 bg-blue-50 px-5 py-3 dark:bg-blue-950/20">
        <span className="mt-0.5 text-blue-600 dark:text-blue-400"><InfoIcon /></span>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>What to do next:</strong> Copy the text below and paste it into ChatGPT, Claude, Gemini, or any AI chat to get much more accurate answers.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row dark:border-slate-800">
        <button
          type="button"
          onClick={handleCopy}
          aria-live="polite"
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:focus:ring-white dark:focus:ring-offset-slate-950"
        >
          {copyLabel === "copied" ? <CheckIcon /> : <CopyIcon />}
          {copyLabel === "copied"
            ? "Copied!"
            : copyLabel === "failed"
            ? "Copy failed — try selecting text below"
            : "Copy to clipboard"}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-500 dark:focus:ring-white dark:focus:ring-offset-slate-950"
        >
          <DownloadIcon />
          Save as .md file
        </button>
      </div>

      {/* Markdown preview */}
      <div className="p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Preview
        </p>
        <pre className="max-h-[280px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100 sm:max-h-[380px] dark:border-slate-800">
          <code>{previewText}</code>
        </pre>
      </div>

      {/* Convert another */}
      <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:text-slate-400 dark:hover:text-white dark:focus:ring-white dark:focus:ring-offset-slate-950"
        >
          <ArrowLeftIcon />
          Convert another file
        </button>
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}): ReactElement {
  return (
    <div className={`rounded-lg border px-3 py-1.5 text-center ${muted ? "border-slate-100 dark:border-slate-800" : "border-slate-200 dark:border-slate-700"}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className={`text-sm font-semibold ${muted ? "text-slate-400 dark:text-slate-500" : "text-slate-950 dark:text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function CheckIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopyIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function DownloadIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v13m0 0-4-4m4 4 4-4M3 21h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8h.01M12 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowLeftIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
