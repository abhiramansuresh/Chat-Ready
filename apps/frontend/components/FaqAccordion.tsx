"use client";

import type { ReactElement } from "react";
import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "What does ChatReady actually do?",
    answer:
      "It converts your document into Markdown — a clean, plain-text format that AI tools like ChatGPT and Claude read most accurately. Think of it as removing all the invisible packaging around your words so the AI can focus on what matters: your actual content.",
  },
  {
    question: "Will my file get smaller after conversion?",
    answer:
      "It depends on the file type. HTML pages and structured documents (DOCX, PPTX, XLSX) can shrink significantly because ChatReady strips out tags, XML markup, and formatting overhead. For plain text files (.txt), the output will be a similar size — and that is perfectly normal. The benefit is the format, not just the size: AI tools read Markdown much more accurately than raw extracted text.",
  },
  {
    question: "Do I need to know what Markdown is to use this?",
    answer:
      "Not at all. You never need to read or edit the Markdown yourself. Just copy the result and paste it into any AI chat — ChatGPT, Claude, Gemini, or others. The AI handles the rest.",
  },
  {
    question: "Does ChatReady use AI on my files?",
    answer:
      "No. ChatReady only converts formats using Microsoft's open-source MarkItDown library. No AI model ever reads or processes your content. Your file is converted by a simple document-parsing tool, not a language model.",
  },
  {
    question: "Are my files stored anywhere?",
    answer:
      "No. Files are written to temporary storage for the conversion only and deleted immediately after your Markdown is ready. Nothing is retained, and there are no logs of your file contents.",
  },
  {
    question: "What file types are supported?",
    answer:
      "PDF, DOCX, TXT, MD, RTF, PPTX, XLSX, CSV, JSON, XML, HTML, PNG, JPG, JPEG, WEBP, and URLs including web pages and YouTube links.",
  },
  {
    question: "Why does the first conversion sometimes take a long time?",
    answer:
      "ChatReady runs on a free hosting plan that goes to sleep after a period of inactivity. The first conversion of the day wakes the server up, which takes about 30 seconds. After that, conversions are fast. We show a message so you know it is not stuck.",
  },
  {
    question: "Is there a file size limit?",
    answer: "Yes — 25MB per file in the current version.",
  },
  {
    question: "How are token savings calculated?",
    answer:
      "We estimate tokens using the cl100k_base tokenizer, which is compatible with GPT-4 and Claude. The \"before\" count is the raw text extracted from your original file. The \"after\" count is the final Markdown. Actual savings vary depending on the AI model you use.",
  },
];

export function FaqAccordion(): ReactElement {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <section
      id="faq"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-2xl">
        <h2
          id="faq-heading"
          className="text-2xl font-bold text-slate-950 sm:text-3xl dark:text-white"
        >
          Frequently asked questions
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
          Still curious? Everything you need to know is below.
        </p>
      </div>

      <div className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        {FAQ_ITEMS.map((item) => {
          const isOpen = openQuestion === item.question;

          return (
            <div key={item.question}>
              <button
                type="button"
                onClick={() => setOpenQuestion(isOpen ? null : item.question)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-slate-950 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-950 dark:text-white dark:hover:bg-slate-950/50 dark:focus:ring-white"
              >
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-transform dark:border-slate-700 dark:text-slate-400 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  <PlusIcon />
                </span>
              </button>
              <div
                className={`grid transition-all duration-200 ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
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

function PlusIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
