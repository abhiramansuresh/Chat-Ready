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
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4 dark:border-slate-700 dark:bg-slate-950">
      <div className="flex w-full flex-col gap-3">
        <label
          htmlFor="url-input"
          className="text-sm font-semibold text-slate-950 dark:text-white"
        >
          Or paste a webpage or YouTube URL
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
            className="min-h-11 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 placeholder:text-slate-400 transition focus:border-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white dark:focus:ring-white dark:focus:ring-offset-slate-950 dark:disabled:bg-slate-900"
          />
          <button
            type="button"
            disabled={disabled}
            onClick={onConvert}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 dark:focus:ring-teal-300 dark:focus:ring-offset-slate-950"
          >
            Convert
          </button>
        </div>
        <p id="url-helper" className="text-xs text-slate-600 dark:text-slate-300">
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
