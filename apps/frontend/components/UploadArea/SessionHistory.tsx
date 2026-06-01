"use client";

import type { ReactElement } from "react";

import type { ConversionResponse } from "@/types/conversion";

import {
  downloadCombinedMarkdown,
  downloadMarkdownFile,
  getSavingsLabel,
} from "./downloads";

export interface SessionHistoryItem {
  readonly createdAtLabel: string;
  readonly id: string;
  readonly result: ConversionResponse;
  readonly sourceLabel: string;
}

interface SessionHistoryProps {
  readonly items: readonly SessionHistoryItem[];
  readonly onClearHistory: () => void;
}

export function SessionHistory({
  items,
  onClearHistory,
}: SessionHistoryProps): ReactElement | null {
  if (items.length === 0) {
    return null;
  }

  function handleDownloadAll(): void {
    downloadCombinedMarkdown(
      items.map((item) => ({
        markdown: item.result.markdown,
        sourceLabel: item.sourceLabel,
      })),
    );
  }

  return (
    <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950 dark:text-white">
            Converted this session
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Download one file or export everything as one Markdown bundle.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleDownloadAll}
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:focus:ring-white dark:focus:ring-offset-slate-950"
          >
            Download all
          </button>
          <button
            type="button"
            onClick={onClearHistory}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white dark:focus:ring-white dark:focus:ring-offset-slate-950"
          >
            Clear
          </button>
        </div>
      </div>

      <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                {item.sourceLabel}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {item.createdAtLabel} · {getSavingsLabel(item.result)}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                downloadMarkdownFile({
                  markdown: item.result.markdown,
                  sourceLabel: item.sourceLabel,
                })
              }
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white dark:focus:ring-white dark:focus:ring-offset-slate-950"
            >
              Download
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
