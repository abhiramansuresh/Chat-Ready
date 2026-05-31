import type { ReactElement } from "react";

interface MarkdownPreviewProps {
  readonly markdown: string;
}

export function MarkdownPreview({ markdown }: MarkdownPreviewProps): ReactElement {
  return (
    <section className="min-h-[28rem] rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-950">Markdown preview</h2>
      </div>
      <pre className="max-h-[34rem] overflow-auto whitespace-pre-wrap break-words p-5 text-sm leading-6 text-slate-800">
        <code>{markdown}</code>
      </pre>
    </section>
  );
}
