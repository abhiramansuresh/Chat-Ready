"use client";

import type { ReactElement } from "react";
import { useState } from "react";

import type { ConversionResponse } from "@/types/conversion";

import { downloadMarkdownFile, formatNumber } from "./downloads";

const HIGH_TOKEN_THRESHOLD = 50_000;
const REDUCTION_THRESHOLD_PERCENT = 5;

const AI_DESTINATIONS = [
  { label: "ChatGPT", url: "https://chatgpt.com", color: "text-emerald-700 dark:text-emerald-400" },
  { label: "Claude", url: "https://claude.ai", color: "text-orange-600 dark:text-orange-400" },
  { label: "Gemini", url: "https://gemini.google.com", color: "text-blue-600 dark:text-blue-400" },
] as const;

interface ResultsPanelProps {
  readonly result: ConversionResponse;
  readonly sourceLabel: string;
  readonly originalFileSizeBytes?: number;
  readonly onReset: () => void;
}

export function ResultsPanel({
  result,
  sourceLabel,
  originalFileSizeBytes,
  onReset,
}: ResultsPanelProps): ReactElement {
  const [copyLabel, setCopyLabel] = useState<"copy" | "copied" | "failed">("copy");
  const [toastLabel, setToastLabel] = useState<string | null>(null);
  const previewText = result.markdown.trim() || "No content was extracted.";

  const isHighTokenCount = result.markdownTokenCount > HIGH_TOKEN_THRESHOLD;

  const tokenReductionPercent = result.reductionPercent;
  const hasTokenReduction = tokenReductionPercent > REDUCTION_THRESHOLD_PERCENT;

  const markdownSizeBytes = new TextEncoder().encode(result.markdown).byteLength;
  const fileSizeReductionPercent =
    originalFileSizeBytes && originalFileSizeBytes > 0
      ? ((originalFileSizeBytes - markdownSizeBytes) / originalFileSizeBytes) * 100
      : 0;
  const hasFileSizeReduction =
    !hasTokenReduction && fileSizeReductionPercent > REDUCTION_THRESHOLD_PERCENT;

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

  async function handleOpenInAI(name: string, url: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(result.markdown);
    } catch {
      // clipboard failed — still open the tab, user can copy manually
    }
    window.open(url, "_blank", "noopener,noreferrer");
    setToastLabel(name);
    window.setTimeout(() => setToastLabel(null), 4000);
  }

  return (
    <div className="relative flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

      {/* Toast */}
      {toastLabel ? (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-x-4 top-4 z-10 flex items-center gap-3 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 shadow-lg animate-fade-in-up dark:border-teal-800 dark:bg-teal-950"
        >
          <span className="shrink-0 text-teal-600 dark:text-teal-400"><CheckIcon /></span>
          <p className="text-sm font-medium text-teal-900 dark:text-teal-200">
            Markdown copied! Press{" "}
            <kbd className="rounded bg-teal-100 px-1 font-mono text-xs dark:bg-teal-900">⌘V</kbd>
            {" "}or{" "}
            <kbd className="rounded bg-teal-100 px-1 font-mono text-xs dark:bg-teal-900">Ctrl+V</kbd>
            {" "}to paste in {toastLabel}.
          </p>
        </div>
      ) : null}

      {/* Success header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
            <CheckIcon />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
              Ready for AI
            </p>
            <h2 className="mt-0.5 text-xl font-bold text-slate-950 dark:text-white">
              Your document is converted
            </h2>
          </div>
        </div>

        {hasTokenReduction ? (
          <StatRow
            label="Token reduction"
            before={`~${formatNumber(result.rawTokenCount)} tokens`}
            after={`~${formatNumber(result.markdownTokenCount)} tokens`}
            badge={`~${Math.round(tokenReductionPercent)}% less`}
          />
        ) : hasFileSizeReduction ? (
          <StatRow
            label="File size reduction"
            before={formatBytes(originalFileSizeBytes!)}
            after={formatBytes(markdownSizeBytes)}
            badge={`~${Math.round(fileSizeReductionPercent)}% smaller`}
          />
        ) : null}
      </div>

      {/* High token warning */}
      {isHighTokenCount ? (
        <div className="flex items-start gap-3 border-b border-amber-100 bg-amber-50 px-5 py-3 dark:border-amber-900/30 dark:bg-amber-950/20">
          <span className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"><WarningIcon /></span>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>Large document:</strong> ~{formatNumber(result.markdownTokenCount)} tokens may exceed the limit of some AI tools. Free ChatGPT allows ~32k tokens. If the AI cuts off your content, try splitting the document into smaller sections.
          </p>
        </div>
      ) : null}

      {/* Send to AI */}
      <div className="border-b border-slate-100 p-5 dark:border-slate-800">
        <p className="mb-3 text-sm font-semibold text-slate-950 dark:text-white">
          Send to AI
        </p>
        <div className="grid grid-cols-3 gap-2">
          {AI_DESTINATIONS.map(({ label, url, color }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleOpenInAI(label, url)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:focus:ring-white dark:focus:ring-offset-slate-950"
            >
              <ExternalLinkIcon className={color} />
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          Opens the AI tool in a new tab with your markdown copied — just press Cmd+V / Ctrl+V to paste.
        </p>
      </div>

      {/* Copy + Download */}
      <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row dark:border-slate-800">
        <button
          type="button"
          onClick={handleCopy}
          aria-live="polite"
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:focus:ring-white dark:focus:ring-offset-slate-950"
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
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-500 dark:focus:ring-white dark:focus:ring-offset-slate-950"
        >
          <DownloadIcon />
          Save as .md file
        </button>
      </div>

      {/* Preview */}
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

interface StatRowProps {
  readonly label: string;
  readonly before: string;
  readonly after: string;
  readonly badge: string;
}

function StatRow({ label, before, after, badge }: StatRowProps): ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </span>
      <span className="text-sm text-slate-500 dark:text-slate-400">{before}</span>
      <span className="text-slate-300 dark:text-slate-600">&rarr;</span>
      <span className="text-sm font-semibold text-slate-950 dark:text-white">{after}</span>
      <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
        {badge}
      </span>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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

function ExternalLinkIcon({ className }: { className: string }): ReactElement {
  return (
    <svg aria-hidden="true" className={`h-4 w-4 ${className}`} viewBox="0 0 24 24" fill="none">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 3h6v6m-11 5L21 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WarningIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path d="M10.3 4.4 2.9 17.2A2 2 0 0 0 4.6 20h14.8a2 2 0 0 0 1.7-2.8L13.7 4.4a2 2 0 0 0-3.4 0ZM12 9v4m0 4h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
