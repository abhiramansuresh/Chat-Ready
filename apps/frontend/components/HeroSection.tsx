import type { ReactElement } from "react";

export function HeroSection(): ReactElement {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
        Free · No sign-up required
      </div>

      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl dark:text-white">
          Get your files ready for AI
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 dark:text-slate-300">
          Upload a PDF, Word doc, spreadsheet, image, or web link.
          ChatReady converts it into a clean format that AI tools like{" "}
          <span className="font-medium text-slate-800 dark:text-slate-200">ChatGPT</span>,{" "}
          <span className="font-medium text-slate-800 dark:text-slate-200">Claude</span>, and{" "}
          <span className="font-medium text-slate-800 dark:text-slate-200">Gemini</span> can read much more accurately.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 text-sm">
        <TrustBadge icon={<ShieldIcon />} text="Your files are never stored" />
        <TrustBadge icon={<LockIcon />} text="No AI reads your content" />
        <TrustBadge icon={<TrashIcon />} text="Deleted right after conversion" />
      </div>
    </section>
  );
}

function TrustBadge({ icon, text }: { icon: ReactElement; text: string }): ReactElement {
  return (
    <span className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
      {icon}
      {text}
    </span>
  );
}

function ShieldIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-4 w-4 text-teal-600 dark:text-teal-400" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-4 w-4 text-teal-600 dark:text-teal-400" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-4 w-4 text-teal-600 dark:text-teal-400" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
