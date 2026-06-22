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
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
      <div className="flex w-full flex-col gap-3">
        <div>
          <label
            htmlFor="url-input"
            className="text-sm font-semibold text-slate-950 dark:text-white"
          >
            Or paste a link instead
          </label>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Works with any webpage or YouTube video
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="url-input"
            name="url"
            type="url"
            value={value}
            placeholder="https://example.com/article  or  youtube.com/watch?v=..."
            disabled={disabled}
            autoComplete="url"
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={errorMessage ? "url-input-error" : undefined}
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 placeholder:text-slate-400 transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-teal-400 dark:focus:ring-teal-400 dark:focus:ring-offset-slate-950 dark:disabled:bg-slate-900"
          />
          <button
            type="button"
            disabled={disabled || !value.trim()}
            onClick={onConvert}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 dark:focus:ring-teal-300 dark:focus:ring-offset-slate-950 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
          >
            Convert link
          </button>
        </div>
        {errorMessage ? (
          <p id="url-input-error" role="alert" className="text-sm text-red-700 dark:text-red-400">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}
