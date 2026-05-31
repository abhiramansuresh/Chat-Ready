import type { ReactElement } from "react";

import type { ConversionResponse } from "@/types/conversion";

import { MarkdownPreview } from "./MarkdownPreview";
import { ResultActions } from "./ResultActions";
import { StatsPanel } from "./StatsPanel";

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
      className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[1fr_320px] lg:items-start"
      aria-label="Conversion result"
      aria-live="polite"
    >
      <MarkdownPreview markdown={result.markdown} />
      <div className="flex flex-col gap-4">
        <StatsPanel result={result} />
        <ResultActions
          markdown={result.markdown}
          onConvertAnother={onConvertAnother}
        />
      </div>
    </section>
  );
}
