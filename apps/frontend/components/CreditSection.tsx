import type { ReactElement } from "react";

export function CreditSection(): ReactElement {
  return (
    <section
      id="credit"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6"
      aria-labelledby="credit-heading"
    >
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          About
        </p>
        <h2
          id="credit-heading"
          className="mt-2 text-xl font-bold text-slate-950 dark:text-white"
        >
          Built by Abhiraman Suresh
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Designed and built as a practical tool for making documents AI-ready.
          ChatReady is{" "}
          <span className="font-medium text-slate-800 dark:text-slate-200">
            fully open source
          </span>{" "}
          — the entire codebase is public on GitHub. You can read the code, report issues, or contribute.
          Powered by{" "}
          <a
            href="https://github.com/microsoft/markitdown"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-teal-700 underline-offset-2 hover:underline dark:text-teal-400"
          >
            Microsoft MarkItDown
          </a>
          , an open-source document conversion library.
        </p>

        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            Open source
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Free to use, inspect, and contribute
          </span>
        </div>

        <a
          href="https://github.com/abhiramansuresh/Chat-Ready"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-500 dark:hover:bg-slate-800 dark:focus:ring-white dark:focus:ring-offset-slate-950"
        >
          <GitHubIcon />
          View on GitHub
        </a>
      </div>
    </section>
  );
}

function GitHubIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10Z" />
    </svg>
  );
}
