import type { ReactElement } from "react";

export function ProductHuntBadge(): ReactElement {
  return (
    <a
      href="https://www.producthunt.com/products/chatready?utm_source=badge&utm_medium=badge&utm_campaign=chatready-site"
      target="_blank"
      rel="noreferrer"
      className="flex w-full max-w-2xl items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      <img
        src="https://ph-files.imgix.net/75b25103-034a-44ed-8277-766eeffafc7c.png?auto=compress,format&codec=mozjpeg&cs=strip&fit=crop&h=80&w=80"
        alt=""
        className="h-12 w-12 shrink-0 rounded-lg object-cover"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-950 dark:text-white">
          We&apos;re live on Product Hunt
        </span>
        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
          Turn any doc or link into clean Markdown for LLMs
        </span>
      </span>
      <span className="shrink-0 rounded-lg bg-[#FF6154] px-3 py-1.5 text-xs font-semibold text-white">
        Check it out →
      </span>
    </a>
  );
}
