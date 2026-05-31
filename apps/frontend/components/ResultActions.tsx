"use client";

import type { ReactElement } from "react";
import { useState } from "react";

interface ResultActionsProps {
  readonly markdown: string;
  readonly onConvertAnother: () => void;
}

export function ResultActions({
  markdown,
  onConvertAnother,
}: ResultActionsProps): ReactElement {
  const [copyLabel, setCopyLabel] = useState("Copy Markdown");

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyLabel("Copied");
      window.setTimeout(() => setCopyLabel("Copy Markdown"), 1800);
    } catch {
      setCopyLabel("Copy failed");
      window.setTimeout(() => setCopyLabel("Copy Markdown"), 1800);
    }
  }

  function handleDownload(): void {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = "chatready-output.md";
    anchor.click();
    URL.revokeObjectURL(downloadUrl);
  }

  return (
    <div className="flex flex-wrap gap-2 lg:justify-end">
      <button
        type="button"
        onClick={handleCopy}
        aria-live="polite"
        aria-label="Copy Markdown to clipboard"
        className="inline-flex min-h-10 flex-1 items-center justify-center whitespace-nowrap rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 sm:flex-none"
      >
        {copyLabel}
      </button>
      <button
        type="button"
        onClick={handleDownload}
        aria-label="Download Markdown file"
        className="inline-flex min-h-10 flex-1 items-center justify-center whitespace-nowrap rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 sm:flex-none"
      >
        Download .md
      </button>
      <button
        type="button"
        onClick={onConvertAnother}
        aria-label="Start another conversion"
        className="inline-flex min-h-10 flex-1 items-center justify-center whitespace-nowrap rounded-md border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800 hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 sm:flex-none"
      >
        Convert another file
      </button>
    </div>
  );
}
