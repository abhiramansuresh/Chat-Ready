import type { ReactElement } from "react";

const STEPS = [
  {
    number: "1",
    title: "Upload your file or paste a link",
    copy: "Choose a PDF, Word doc, spreadsheet, presentation, image, or any web page URL. Up to 25MB. No account or sign-up needed.",
  },
  {
    number: "2",
    title: "We convert it to AI-friendly text",
    copy: "ChatReady strips out formatting overhead — PDF encoding, XML tags, binary data — and turns your content into plain, structured text (called Markdown) that AI tools read best.",
  },
  {
    number: "3",
    title: "Paste it into any AI chat",
    copy: "Copy your result and paste it into ChatGPT, Claude, Gemini, or any other AI. You will get much more accurate, relevant answers because the AI can actually understand your content.",
  },
];

export function HowItWorks(): ReactElement {
  return (
    <section
      id="how-it-works"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6"
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-2xl">
        <h2
          id="how-it-works-heading"
          className="text-2xl font-bold text-slate-950 sm:text-3xl dark:text-white"
        >
          How it works
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
          Three steps, no technical knowledge required.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {STEPS.map((step) => (
          <article
            key={step.number}
            className="relative rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
              {step.number}
            </div>
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {step.copy}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
          <LightbulbIcon />
          What is Markdown, and why does it matter?
        </h3>
        <p className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-300">
          Markdown is just plain text with simple symbols for headings, bold, and lists — like{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs dark:bg-amber-900">**bold**</code>{" "}
          or{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs dark:bg-amber-900"># Heading</code>.
          {" "}PDFs and Word documents store a lot of hidden formatting data that wastes
          AI processing capacity and can cause the AI to misread your content. Converting
          to Markdown removes that noise — so the AI spends its attention on your actual words.
        </p>
        <p className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-300">
          <strong>Note:</strong> For plain text files, the output will look similar in size — that is normal.
          The value is the format, not just the size.
        </p>
      </div>
    </section>
  );
}

function LightbulbIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.2-1.2 4.1-3 5.2V17a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2.8C7.2 13.1 6 11.2 6 9a6 6 0 0 1 6-6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
