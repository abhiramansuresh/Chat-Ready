"use client";

import type { ReactElement } from "react";
import { useState } from "react";

import type { ConversionResponse } from "@/types/conversion";

import { downloadMarkdownFile, formatNumber } from "./downloads";

const HIGH_TOKEN_THRESHOLD = 50_000;
const REDUCTION_THRESHOLD_PERCENT = 5;

const AI_DESTINATIONS = [
  {
    label: "ChatGPT",
    url: "https://chatgpt.com",
    bg: "bg-[#10A37F] hover:bg-[#0d8f6f] focus:ring-[#10A37F]",
    Icon: ChatGPTIcon,
  },
  {
    label: "Claude",
    url: "https://claude.ai",
    bg: "bg-[#D97757] hover:bg-[#c4633e] focus:ring-[#D97757]",
    Icon: ClaudeIcon,
  },
  {
    label: "Gemini",
    url: "https://gemini.google.com",
    bg: "bg-[#4285F4] hover:bg-[#2b6fdb] focus:ring-[#4285F4]",
    Icon: GeminiIcon,
  },
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
          {AI_DESTINATIONS.map(({ label, url, bg, Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleOpenInAI(label, url)}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 ${bg}`}
            >
              <Icon />
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

function ChatGPTIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.032.067L9.856 19.95a4.496 4.496 0 0 1-6.256-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.496 4.496 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.496 4.496 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

function ClaudeIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" />
    </svg>
  );
}

function GeminiIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12" />
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
