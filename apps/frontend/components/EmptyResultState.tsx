import type { ReactElement } from "react";

export function EmptyResultState(): ReactElement {
  return (
    <section
      className="mx-auto max-w-6xl px-6 pb-10"
      aria-label="Result placeholder"
    >
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-6 text-sm text-slate-600">
        Your Markdown preview and token stats will appear here after a
        successful conversion.
      </div>
    </section>
  );
}
