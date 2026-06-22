import type { ReactElement } from "react";

import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#privacy", label: "Privacy" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar(): ReactElement {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a
          href="#top"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:text-white dark:focus:ring-white dark:focus:ring-offset-slate-950"
        >
          <LogoIcon />
          ChatReady
        </a>
        <nav aria-label="Page sections" className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 sm:block dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:ring-white dark:focus:ring-offset-slate-950"
            >
              {item.label}
            </a>
          ))}
          <ThemeToggle />
          <a
            href="#upload"
            className="ml-1 inline-flex min-h-9 items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:focus:ring-white dark:focus:ring-offset-slate-950"
          >
            Convert now
          </a>
        </nav>
      </div>
    </header>
  );
}

function LogoIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6 text-teal-600 dark:text-teal-400"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v6h6M9 13h6M9 17h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
