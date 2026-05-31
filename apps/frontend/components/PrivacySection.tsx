import type { ReactElement } from "react";

const PRIVACY_POINTS = [
  "No AI processing",
  "No file storage",
  "Temporary files auto-delete after conversion",
  "File contents and Markdown output are never logged",
];

export function PrivacySection(): ReactElement {
  return (
    <section className="bg-white" aria-labelledby="privacy-heading">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="max-w-3xl">
          <h2
            id="privacy-heading"
            className="text-2xl font-semibold text-slate-950"
          >
            Private by default
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            ChatReady prepares content for AI tools. It does not chat with your
            files, summarize them, or keep a document history.
          </p>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {PRIVACY_POINTS.map((point) => (
            <li
              key={point}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800"
            >
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
