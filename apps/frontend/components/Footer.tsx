import type { ReactElement } from "react";

export function Footer(): ReactElement {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-slate-400">
        <p>&copy; 2026 ChatReady &mdash; Built by Abhiraman Suresh</p>
        <div className="flex gap-4">
          <a
            href="#privacy"
            className="hover:text-slate-950 dark:hover:text-white"
          >
            Privacy
          </a>
          <a
            href="https://github.com/microsoft/markitdown"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-950 dark:hover:text-white"
          >
            Powered by MarkItDown
          </a>
        </div>
      </div>
    </footer>
  );
}
