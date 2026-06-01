import type { ReactElement } from "react";

const FORMAT_CATEGORIES = [
  {
    title: "Documents",
    formats: ["PDF", "DOCX", "TXT / MD / RTF"],
  },
  {
    title: "Slides & Sheets",
    formats: ["PPTX", "XLSX", "CSV"],
  },
  {
    title: "Structured",
    formats: ["JSON", "XML", "HTML"],
  },
  {
    title: "Media",
    formats: ["PNG / JPG", "JPEG / WEBP", "YouTube URLs"],
  },
];

export function FormatGrid(): ReactElement {
  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6"
      aria-labelledby="formats-heading"
    >
      <h2 id="formats-heading" className="text-2xl font-semibold text-slate-950 dark:text-white">
        Supported formats
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FORMAT_CATEGORIES.map((category) => (
          <article
            key={category.title}
            className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
              <CategoryIcon />
            </div>
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">
              {category.title}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {category.formats.map((format) => (
                <li key={format}>{format}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function CategoryIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 4h10v16H7V4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 8h4M10 12h4M10 16h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
