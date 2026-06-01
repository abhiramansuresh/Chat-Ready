"use client";

import type { ReactElement } from "react";
import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "Does ChatReady use AI on my files?",
    answer:
      "No. ChatReady only converts supported formats into clean Markdown using Microsoft's MarkItDown library. No AI model processes your content.",
  },
  {
    question: "Are my files stored?",
    answer:
      "No. Files are written to temporary storage and automatically deleted after conversion. Nothing is retained.",
  },
  {
    question: "What file types are supported?",
    answer:
      "PDF, DOCX, TXT, MD, RTF, PPTX, XLSX, CSV, JSON, XML, HTML, PNG, JPG, JPEG, WEBP, and URLs including webpages and YouTube links.",
  },
  {
    question: "How are token savings calculated?",
    answer:
      "We estimate tokens using the cl100k_base tokenizer, which is compatible with GPT-4 and Claude. Actual savings will vary depending on the model you use.",
  },
  {
    question: "Is there a file size limit?",
    answer: "Yes — 25MB per file in V1.",
  },
];

export function FaqAccordion(): ReactElement {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <section
      id="faq"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6"
      aria-labelledby="faq-heading"
    >
      <h2 id="faq-heading" className="text-2xl font-semibold text-slate-950 dark:text-white">
        FAQ
      </h2>
      <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        {FAQ_ITEMS.map((item) => {
          const isOpen = openQuestion === item.question;

          return (
            <div key={item.question}>
              <button
                type="button"
                onClick={() => setOpenQuestion(isOpen ? null : item.question)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-slate-950 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-950 dark:text-white dark:hover:bg-slate-950 dark:focus:ring-white"
              >
                <span>{item.question}</span>
                <span aria-hidden="true" className="text-xl leading-none">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              <div
                className={`grid transition-all duration-200 ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
