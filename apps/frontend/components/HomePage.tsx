"use client";

import type { ReactElement } from "react";
import { useState } from "react";

import type { ConversionResponse } from "@/types/conversion";

import { EmptyResultState } from "./EmptyResultState";
import { FaqSection } from "./FaqSection";
import { HeroSection } from "./HeroSection";
import { PrivacySection } from "./PrivacySection";
import { ResultExperience } from "./ResultExperience";
import { SupportedFormats } from "./SupportedFormats";
import { UploadPanel } from "./UploadPanel";

type InputMode = "file" | "url";

export function HomePage(): ReactElement {
  const [activeMode, setActiveMode] = useState<InputMode>("file");
  const [conversionResult, setConversionResult] =
    useState<ConversionResponse | null>(null);
  const [resetKey, setResetKey] = useState(0);

  function scrollToConverter(): void {
    document.getElementById("converter")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  function handleConversionComplete(result: ConversionResponse): void {
    setConversionResult(result);
    window.setTimeout(() => {
      document.getElementById("result")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function handleConvertAnother(): void {
    setConversionResult(null);
    setActiveMode("file");
    setResetKey((currentValue) => currentValue + 1);
    scrollToConverter();
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 py-10 sm:px-6 lg:min-h-[calc(100vh-80px)] lg:justify-center lg:py-14">
        <HeroSection />
        <div className="w-full max-w-4xl">
          <UploadPanel
            activeMode={activeMode}
            resetKey={resetKey}
            onModeChange={setActiveMode}
            onConversionComplete={handleConversionComplete}
          />
        </div>
      </div>
      {conversionResult ? (
        <ResultExperience
          result={conversionResult}
          onConvertAnother={handleConvertAnother}
        />
      ) : (
        <EmptyResultState />
      )}
      <SupportedFormats />
      <PrivacySection />
      <FaqSection />
    </main>
  );
}
