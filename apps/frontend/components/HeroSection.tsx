import type { ReactElement } from "react";

interface HeroSectionProps {
  readonly onSelectFileMode: () => void;
  readonly onSelectUrlMode: () => void;
}

export function HeroSection({
  onSelectFileMode,
  onSelectUrlMode,
}: HeroSectionProps): ReactElement {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold uppercase text-teal-700">ChatReady</p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
          Make your documents AI-ready
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-700">
          Convert PDFs, Docs, Slides, Sheets, Images, Videos and webpages into
          clean Markdown for AI.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onSelectFileMode}
          aria-label="Choose file upload mode"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={onSelectUrlMode}
          aria-label="Choose URL paste mode"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
        >
          Paste URL
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-sm text-slate-700">
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
