import type { ReactElement } from "react";

const PRIVACY_POINTS = [
  {
    title: "No AI processing",
    copy: "Your content is converted, not sent to an AI model.",
  },
  {
    title: "No file storage",
    copy: "Uploads are handled as temporary processing files only.",
  },
  {
    title: "Auto-deleted after conversion",
    copy: "Temporary files are removed after the Markdown is created.",
  },
  {
    title: "Nothing is logged",
    copy: "File contents and Markdown output are never written to logs.",
  },
];

export function PrivacySection(): ReactElement {
  return (
    <section className="bg-white dark:bg-slate-900" aria-labelledby="privacy-heading">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="max-w-3xl">
          <h2
            id="privacy-heading"
            className="text-2xl font-semibold text-slate-950 dark:text-white"
          >
            Privacy and trust
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-700 dark:text-slate-300">
            ChatReady prepares content for AI tools. It does not chat with your
            files, summarize them, or keep a document history.
          </p>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRIVACY_POINTS.map((point) => (
            <li
              key={point.title}
              className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-white text-teal-700 shadow-sm dark:bg-slate-900 dark:text-teal-300">
                <TrustIcon />
              </div>
              <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                {point.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {point.copy}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TrustIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
