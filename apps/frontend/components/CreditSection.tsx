import type { ReactElement } from "react";

export function CreditSection(): ReactElement {
  return (
    <section
      id="credit"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6"
      aria-labelledby="credit-heading"
    >
      <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Credit
        </p>
        <h2 id="credit-heading" className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
          Built by Abhiraman Suresh
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Designed and built as a practical document preparation tool for AI.
        </p>
        <a
          href="https://abhiraman.in"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-500 dark:focus:ring-white dark:focus:ring-offset-slate-950"
        >
          abhiraman.in
        </a>
      </div>
    </section>
  );
}
