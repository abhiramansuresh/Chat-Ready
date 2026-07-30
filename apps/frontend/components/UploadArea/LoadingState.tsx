"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";

const STAGES = [
  {
    afterMs: 0,
    message: "Reading your document…",
    subtext: "Stripping out all the invisible junk your AI doesn't need.",
  },
  {
    afterMs: 7000,
    message: "Still going. We're not slacking.",
    subtext: "Big files take a moment. Your document is getting the full treatment.",
  },
  {
    afterMs: 16000,
    message: "Okay this one's putting up a fight.",
    subtext: "Probably a very important document. We're handling it with care.",
  },
  {
    afterMs: 26000,
    message: "Still here. Still spinning. Still converting.",
    subtext: "We haven't given up. Promise.",
  },
  {
    afterMs: 38000,
    message: "This is awkward for both of us.",
    subtext: "Almost there. Probably. Definitely maybe.",
  },
];

interface LoadingStateProps {
  /** 1-based position in a multi-file batch; omitted for a single conversion. */
  readonly current?: number;
  readonly total?: number;
  readonly fileName?: string;
}

export function LoadingState({
  current,
  total,
  fileName,
}: LoadingStateProps): ReactElement {
  const [stageIndex, setStageIndex] = useState(0);
  const isBatch = Boolean(total && total > 1);

  // Restart the patter for each file in a batch, so "still going" tracks the
  // file on screen rather than the whole queue.
  useEffect(() => {
    setStageIndex(0);
    const timers: ReturnType<typeof setTimeout>[] = [];

    STAGES.forEach((stage, index) => {
      if (index === 0) return;
      const timer = setTimeout(() => setStageIndex(index), stage.afterMs);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [current]);

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
        {isBatch ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
            File {current} of {total}
            {fileName ? <span className="block normal-case tracking-normal text-slate-500 dark:text-slate-400">{fileName}</span> : null}
          </p>
        ) : null}
        <p className="text-lg font-semibold text-slate-950 transition-all dark:text-white">
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
