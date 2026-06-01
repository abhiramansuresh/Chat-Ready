import type { ReactElement } from "react";

export function Footer(): ReactElement {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-slate-400">
        <p>© 2025 ChatReady</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-950 dark:hover:text-white">
            Privacy
          </a>
          <a href="#" className="hover:text-slate-950 dark:hover:text-white">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
