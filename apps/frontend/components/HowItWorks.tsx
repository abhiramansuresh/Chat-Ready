import type { ReactElement } from "react";

const STEPS = [
  {
    title: "Upload",
    copy: "Drop a file or paste a URL",
  },
  {
    title: "Convert",
    copy: "ChatReady extracts clean, structured Markdown",
  },
  {
    title: "Use with AI",
    copy: "Paste into ChatGPT, Claude, or any LLM for better results",
  },
];

export function HowItWorks(): ReactElement {
  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6"
      aria-labelledby="how-it-works-heading"
    >
      <h2 id="how-it-works-heading" className="text-2xl font-semibold text-slate-950 dark:text-white">
        How it works
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <article
            key={step.title}
            className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
              {index + 1}
            </div>
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {step.copy}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
