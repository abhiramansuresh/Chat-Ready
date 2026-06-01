import type { ReactElement } from "react";

interface ErrorStateProps {
  readonly message: string;
  readonly onTryAgain: () => void;
}

export function ErrorState({
  message,
  onTryAgain,
}: ErrorStateProps): ReactElement {
  return (
    <div className="flex min-h-[28rem] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 px-6 py-12 text-center dark:border-red-900/70 dark:bg-red-950/30">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-700 shadow-sm dark:bg-red-950 dark:text-red-300">
        <ErrorIcon />
      </div>
      <p role="alert" className="max-w-md text-base font-semibold text-red-900 dark:text-red-100">
        {message}
      </p>
      <button
        type="button"
        onClick={onTryAgain}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 dark:bg-red-300 dark:text-red-950 dark:hover:bg-red-200 dark:focus:ring-red-200 dark:focus:ring-offset-slate-950"
      >
        Try again
      </button>
    </div>
  );
}

function ErrorIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 8v5m0 4h.01M10.3 4.4 2.9 17.2A2 2 0 0 0 4.6 20h14.8a2 2 0 0 0 1.7-2.8L13.7 4.4a2 2 0 0 0-3.4 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
