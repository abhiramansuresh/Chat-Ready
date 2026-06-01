"use client";

import type { KeyboardEvent, ReactElement } from "react";

interface UrlInputProps {
  readonly disabled: boolean;
  readonly errorMessage: string | null;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onConvert: () => void;
}

export function UrlInput({
  disabled,
  errorMessage,
  value,
  onChange,
  onConvert,
}: UrlInputProps): ReactElement {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      onConvert();
    }
  }

  return (
    <div className="flex min-h-56 flex-col justify-center rounded-lg border border-slate-200 bg-slate-50 px-5 py-8 sm:min-h-64 sm:px-8 dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        <label
          htmlFor="url-input"
          className="text-base font-semibold text-slate-950 dark:text-white"
        >
          Paste a webpage or YouTube URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="url-input"
            name="url"
            type="url"
            value={value}
            placeholder="Paste a webpage or YouTube URL"
            disabled={disabled}
            autoComplete="url"
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={errorMessage ? "url-input-error" : "url-helper"}
            className="min-h-12 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-4 text-base text-slate-950 placeholder:text-slate-400 transition focus:border-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white dark:focus:ring-white dark:focus:ring-offset-slate-950 dark:disabled:bg-slate-900"
          />
          <button
            type="button"
            disabled={disabled}
            onClick={onConvert}
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 dark:focus:ring-teal-300 dark:focus:ring-offset-slate-950"
          >
            Convert
          </button>
        </div>
        <p id="url-helper" className="text-sm text-slate-600 dark:text-slate-300">
          Supports webpages and YouTube videos
        </p>
        {errorMessage ? (
          <p id="url-input-error" role="alert" className="text-sm text-red-700 dark:text-red-300">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}
