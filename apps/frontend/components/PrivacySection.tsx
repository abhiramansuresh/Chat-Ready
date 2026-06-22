import type { ReactElement } from "react";

const PRIVACY_POINTS = [
  {
    title: "No AI reads your files",
    copy: "ChatReady converts your document — it does not send it to any AI model for processing.",
  },
  {
    title: "Nothing is stored",
    copy: "Your file is written to temporary storage for the conversion only. We never keep a copy.",
  },
  {
    title: "Deleted right after",
    copy: "The temporary file is removed the moment your Markdown is ready.",
  },
  {
    title: "No account needed",
    copy: "No sign-up, no email, no tracking. Just upload, convert, and go.",
  },
];

export function PrivacySection(): ReactElement {
  return (
    <section
      id="privacy"
      className="scroll-mt-24 bg-white dark:bg-slate-900"
      aria-labelledby="privacy-heading"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2
            id="privacy-heading"
            className="text-2xl font-bold text-slate-950 sm:text-3xl dark:text-white"
          >
            Your privacy, guaranteed
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
            ChatReady prepares your content for AI — it never reads, stores, or
            shares what is inside your files.
          </p>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRIVACY_POINTS.map((point) => (
            <li
              key={point.title}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm dark:bg-slate-900 dark:text-teal-300">
                <ShieldCheckIcon />
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

function ShieldCheckIcon(): ReactElement {
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
