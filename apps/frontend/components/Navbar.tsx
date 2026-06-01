import type { ReactElement } from "react";

const NAV_ITEMS = [
  { href: "#upload", label: "Convert" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#privacy", label: "Privacy" },
  { href: "#faq", label: "FAQ" },
  { href: "#credit", label: "Credit" },
];

export function Navbar(): ReactElement {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
        <a
          href="#top"
          className="text-lg font-bold tracking-tight text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:text-white dark:focus:ring-white dark:focus:ring-offset-slate-950"
        >
          ChatReady
        </a>
        <nav aria-label="Page sections" className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-slate-600 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:text-slate-300 dark:hover:text-white dark:focus:ring-white dark:focus:ring-offset-slate-950"
            >
              {item.label}
            </a>
          ))}
          <span className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300">
            Powered by MarkItDown
          </span>
        </nav>
      </div>
    </header>
  );
}
