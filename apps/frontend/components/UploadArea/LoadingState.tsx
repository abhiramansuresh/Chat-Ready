"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";

const STAGES = [
  {
    afterMs: 0,
    message: "Converting your document…",
    subtext: null,
  },
  {
    afterMs: 8000,
    message: "The server is waking up — hang tight.",
    subtext:
      "This happens on the first visit of the day and takes about 30 seconds. Conversions after this will be much faster.",
  },
  {
    afterMs: 28000,
    message: "Almost there…",
    subtext:
      "Large or complex files can take a little longer. Your document is on its way.",
  },
];

export function LoadingState(): ReactElement {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    STAGES.forEach((stage, index) => {
      if (index === 0) return;
      const timer = setTimeout(() => setStageIndex(index), stage.afterMs);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const stage = STAGES[stageIndex];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={stage.message}
      className="flex min-h-[28rem] flex-col items-center justify-center gap-6 rounded-lg border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900"
    >
      <span className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600 dark:border-slate-700 dark:border-t-teal-400" />
      <div className="max-w-sm">
        <p className="text-lg font-semibold text-slate-950 dark:text-white">
          {stage.message}
        </p>
        {stage.subtext ? (
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {stage.subtext}
          </p>
        ) : null}
      </div>
    </div>
  );
}
