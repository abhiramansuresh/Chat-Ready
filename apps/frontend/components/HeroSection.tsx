import type { ReactElement } from "react";

export function HeroSection(): ReactElement {
  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl dark:text-white">
          Make your documents AI-ready
        </h1>
        <p className="max-w-3xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8 dark:text-slate-300">
          Convert PDFs, Docs, Slides, Sheets, Images, Videos and webpages into
          clean Markdown for ChatGPT, Claude and other AI tools.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <span className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 dark:border-teal-900 dark:bg-teal-950">
          No AI processing
        </span>
        <span className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900 dark:bg-amber-950">
          Auto-delete after conversion
        </span>
      </div>
    </section>
  );
}
