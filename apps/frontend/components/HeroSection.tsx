import type { ReactElement } from "react";

export function HeroSection(): ReactElement {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm font-semibold uppercase text-teal-700">ChatReady</p>
        <h1 className="text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
          Make your documents AI-ready
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-700">
          Convert PDFs, Docs, Slides, Sheets, Images, Videos and webpages into
          clean Markdown for AI.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 text-sm text-slate-700">
        <span className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2">
          No AI processing
        </span>
        <span className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
          Auto-delete after conversion
        </span>
      </div>
    </section>
  );
}
