import type { ReactElement } from "react";

import type { ConversionResponse } from "@/types/conversion";

import { ResultActions } from "./ResultActions";

interface MarkdownPreviewProps {
  readonly result: ConversionResponse;
  readonly onConvertAnother: () => void;
}

export function MarkdownPreview({
  result,
  onConvertAnother,
}: MarkdownPreviewProps): ReactElement {
  const previewText =
    result.markdown.trim() || "No Markdown content was generated.";
  const savingsText = getSavingsText(result.reductionPercent);
  const tooltipText = [
    `Original: ${formatNumber(result.rawTokenCount)} tokens`,
    `Markdown: ${formatNumber(result.markdownTokenCount)} tokens`,
    `Processing: ${formatNumber(result.processingTimeMs)} ms`,
  ].join(" | ");

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-950">
            Markdown preview
          </h2>
          <p
            className="mt-2 inline-flex rounded-md bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800"
            title={tooltipText}
            aria-label={`${savingsText}. ${tooltipText}`}
          >
            {savingsText}
          </p>
        </div>
        <ResultActions
          markdown={result.markdown}
          onConvertAnother={onConvertAnother}
        />
      </div>
      <pre className="max-h-[38rem] max-w-full overflow-auto whitespace-pre-wrap break-words p-4 text-sm leading-6 text-slate-800 sm:p-5">
        <code>{previewText}</code>
      </pre>
    </section>
  );
}

function getSavingsText(reductionPercent: number): string {
  const roundedPercent = Math.abs(Math.round(reductionPercent));

  if (reductionPercent > 0) {
    return `Saved about ${roundedPercent}%`;
  }

  if (reductionPercent < 0) {
    return `About ${roundedPercent}% larger`;
  }

  return "About the same size";
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
