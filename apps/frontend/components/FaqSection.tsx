import type { ReactElement } from "react";

const FAQ_ITEMS = [
  {
    question: "Does ChatReady use AI on my files?",
    answer: "No. V1 only converts supported inputs into clean Markdown.",
  },
  {
    question: "Are uploads stored?",
    answer: "No. Files are written to temporary storage and deleted after processing.",
  },
  {
    question: "What can I convert?",
    answer:
      "PDF, DOCX, TXT, MD, RTF, PPTX, XLSX, CSV, JSON, XML, HTML, PNG, JPG, JPEG, WEBP, webpages, and YouTube URLs.",
  },
];

export function FaqSection(): ReactElement {
  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6"
      aria-labelledby="faq-heading"
    >
      <h2 id="faq-heading" className="text-2xl font-semibold text-slate-950">
        FAQ
      </h2>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {FAQ_ITEMS.map((item) => (
          <article
            key={item.question}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <h3 className="text-base font-semibold text-slate-950">
              {item.question}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {item.answer}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
