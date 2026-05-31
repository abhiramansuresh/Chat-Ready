import type { ReactElement } from "react";

import type { ConversionResponse } from "@/types/conversion";

import { MarkdownPreview } from "./MarkdownPreview";

interface ResultExperienceProps {
  readonly result: ConversionResponse;
  readonly onConvertAnother: () => void;
}

export function ResultExperience({
  result,
  onConvertAnother,
}: ResultExperienceProps): ReactElement {
  return (
    <section
      id="result"
      className="mx-auto w-full max-w-6xl min-w-0 px-4 py-10 sm:px-6"
      aria-label="Conversion result"
      aria-live="polite"
    >
      <MarkdownPreview result={result} onConvertAnother={onConvertAnother} />
    </section>
  );
}
