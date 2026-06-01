import type { ReactElement } from "react";

export function Navbar(): ReactElement {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="#top"
          className="text-lg font-bold tracking-tight text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:text-white dark:focus:ring-white dark:focus:ring-offset-slate-950"
        >
          ChatReady
        </a>
        <span className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300">
          Powered by MarkItDown
        </span>
      </div>
    </header>
  );
}
