import type { FormEvent, ReactElement } from "react";

interface UrlInputFormProps {
  readonly disabled: boolean;
  readonly onSubmit: (url: string) => void;
}

export function UrlInputForm({
  disabled,
  onSubmit,
}: UrlInputFormProps): ReactElement {
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const url = String(formData.get("url") ?? "");
    onSubmit(url);
  }

  return (
    <form
      className="flex min-h-72 flex-col justify-center gap-4 rounded-md border border-slate-200 bg-slate-50 px-5 py-8 sm:min-h-80 sm:px-8"
      onSubmit={handleSubmit}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        <label
          htmlFor="url-input"
          className="text-base font-semibold text-slate-950"
        >
          Paste a webpage or video URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="url-input"
            name="url"
            type="url"
            placeholder="https://example.com"
            disabled={disabled}
            required
            autoComplete="url"
            className="min-h-11 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-4 text-base text-slate-950 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={disabled}
            aria-label="Convert URL to Markdown"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Convert URL
          </button>
        </div>
      </div>
    </form>
  );
}
