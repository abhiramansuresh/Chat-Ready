import type { ReactElement } from "react";

const FORMAT_GROUPS = [
  {
    title: "Documents",
    formats: ["PDF", "DOCX", "TXT", "MD", "RTF"],
  },
  {
    title: "Slides and sheets",
    formats: ["PPTX", "XLSX", "CSV"],
  },
  {
    title: "Structured",
    formats: ["JSON", "XML", "HTML"],
  },
  {
    title: "Images",
    formats: ["PNG", "JPG", "JPEG", "WEBP"],
  },
  {
    title: "URLs",
    formats: ["YouTube", "Webpages"],
  },
];

export function SupportedFormats(): ReactElement {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
      {FORMAT_GROUPS.map((group) => (
        <div key={group.title} className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-950">
            {group.title}
          </h2>
          <div className="flex flex-wrap gap-2">
            {group.formats.map((format) => (
              <span
                key={format}
                className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
              >
                {format}
              </span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
