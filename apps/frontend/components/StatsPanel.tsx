import type { ReactElement } from "react";

import type { ConversionResponse } from "@/types/conversion";

interface StatsPanelProps {
  readonly result: ConversionResponse;
}

export function StatsPanel({ result }: StatsPanelProps): ReactElement {
  const stats = [
    {
      label: "Estimated tokens",
      value: formatNumber(result.markdownTokenCount),
    },
    {
      label: "Raw token count",
      value: formatNumber(result.rawTokenCount),
    },
    {
      label: "Markdown token count",
      value: formatNumber(result.markdownTokenCount),
    },
    {
      label: "Reduction",
      value: `${result.reductionPercent}%`,
    },
    {
      label: "File type",
      value: result.fileType.toUpperCase(),
    },
    {
      label: "Processing time",
      value: `${formatNumber(result.processingTimeMs)} ms`,
    },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-base font-semibold text-slate-950">Token stats</h2>
      <dl className="grid gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between gap-4 rounded-md bg-slate-50 px-3 py-3"
          >
            <dt className="text-sm text-slate-600">{stat.label}</dt>
            <dd className="text-sm font-semibold text-slate-950">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
