import type { ReactElement } from "react";

export function EmptyResultState(): ReactElement {
  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6"
      aria-label="Result placeholder"
    >
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-6 text-sm text-slate-600">
        Your Markdown preview and estimated savings will appear here after a
        successful conversion.
      </div>
    </section>
  );
}
