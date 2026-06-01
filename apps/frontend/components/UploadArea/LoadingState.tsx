import type { ReactElement } from "react";

export function LoadingState(): ReactElement {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[28rem] flex-col items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900"
    >
      <span className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-teal-700 dark:border-slate-700 dark:border-t-teal-300" />
      <p className="text-lg font-semibold text-slate-950 dark:text-white">
        Converting…
      </p>
    </div>
  );
}
