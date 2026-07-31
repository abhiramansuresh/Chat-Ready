"use client";

import type { ReactElement } from "react";
import { useState } from "react";

import type { ConversionResponse } from "@/types/conversion";

import { downloadMarkdownFile, formatNumber } from "./downloads";

const HIGH_TOKEN_THRESHOLD = 50_000;
const REDUCTION_THRESHOLD_PERCENT = 5;

interface ResultsPanelProps {
  readonly result: ConversionResponse;
  readonly sourceLabel: string;
  readonly originalFileSizeBytes?: number;
  readonly convertedCount: number;
  readonly failedNames: readonly string[];
  readonly onReset: () => void;
}

export function ResultsPanel({
  result,
  sourceLabel,
  originalFileSizeBytes,
  convertedCount,
  failedNames,
  onReset,
}: ResultsPanelProps): ReactElement {
  const [copyLabel, setCopyLabel] = useState<"copy" | "copied" | "failed">("copy");
  const previewText = result.markdown.trim() || "No content was extracted.";

  const isHighTokenCount = result.markdownTokenCount > HIGH_TOKEN_THRESHOLD;

  // Tokens are what the AI actually charges for and truncates on, so a real
  // token saving always wins. File size is the fallback only when the
  // conversion changed nothing about the token count (binary sources such as
  // DOCX, where the "before" token count is meaningless).
  const tokensSaved = result.rawTokenCount - result.markdownTokenCount;
  const hasTokenReduction =
    result.reductionPercent > REDUCTION_THRESHOLD_PERCENT && tokensSaved > 0;

  const markdownSizeBytes = new TextEncoder().encode(result.markdown).byteLength;
  const fileSizeReductionPercent =
    originalFileSizeBytes && originalFileSizeBytes > 0
      ? ((originalFileSizeBytes - markdownSizeBytes) / originalFileSizeBytes) * 100
      : 0;
  const hasFileSizeReduction = !hasTokenReduction && fileSizeReductionPercent > 0;

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

  return (
    <div className="relative flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Success header — the "convert another" CTA lives here so it is
          visible without scrolling past the preview. */}
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
              <CheckIcon />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
                Ready for AI
              </p>
              <h2 className="mt-0.5 text-xl font-bold text-slate-950 dark:text-white">
                {convertedCount > 1
                  ? `${convertedCount} documents converted`
                  : "Your document is converted"}
              </h2>
              <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                {sourceLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-teal-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 dark:focus:ring-teal-400 dark:focus:ring-offset-slate-950"
          >
            <PlusIcon />
            Convert next file
          </button>
        </div>

        {hasFileSizeReduction ? (
          <StatRow
            label="File size reduction"
            before={formatBytes(originalFileSizeBytes!)}
            after={formatBytes(markdownSizeBytes)}
            badge={`~${Math.round(fileSizeReductionPercent)}% smaller`}
          />
        ) : (
          <TokenSummary
            tokens={result.markdownTokenCount}
            tokensSaved={hasTokenReduction ? tokensSaved : null}
            reductionPercent={result.reductionPercent}
          />
        )}
      </div>

      {/* Partial batch failure */}
      {failedNames.length > 0 ? (
        <div className="flex items-start gap-3 border-b border-amber-100 bg-amber-50 px-5 py-3 dark:border-amber-900/30 dark:bg-amber-950/20">
          <span className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"><WarningIcon /></span>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>
              {failedNames.length} {failedNames.length === 1 ? "file" : "files"} could not
              be converted:
            </strong>{" "}
            {failedNames.join(", ")}. The rest are ready below.
          </p>
        </div>
      ) : null}

      {/* High token warning */}
      {isHighTokenCount ? (
        <div className="flex items-start gap-3 border-b border-amber-100 bg-amber-50 px-5 py-3 dark:border-amber-900/30 dark:bg-amber-950/20">
          <span className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"><WarningIcon /></span>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>Large document:</strong> ~{formatNumber(result.markdownTokenCount)} tokens may exceed the limit of some AI tools. Free ChatGPT allows ~32k tokens. If the AI cuts off your content, try splitting the document into smaller sections.
          </p>
        </div>
      ) : null}

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
    </div>
  );
}

interface TokenSummaryProps {
  readonly tokens: number;
  readonly tokensSaved: number | null;
  readonly reductionPercent: number;
}

function TokenSummary({
  tokens,
  tokensSaved,
  reductionPercent,
}: TokenSummaryProps): ReactElement {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        Tokens to paste
      </span>
      <span className="text-lg font-bold text-slate-950 dark:text-white">
        ~{formatNumber(tokens)}
      </span>
      {tokensSaved ? (
        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
          {formatNumber(tokensSaved)} saved &middot; ~{Math.round(reductionPercent)}% less
        </span>
      ) : (
        <span className="text-xs text-slate-400 dark:text-slate-500">
          already compact &mdash; converting gains you format, not size
        </span>
      )}
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

function PlusIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
