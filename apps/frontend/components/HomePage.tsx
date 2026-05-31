"use client";

import type { ReactElement } from "react";
import { useState } from "react";

import { HeroSection } from "./HeroSection";
import { SupportedFormats } from "./SupportedFormats";
import { UploadPanel } from "./UploadPanel";

type InputMode = "file" | "url";

export function HomePage(): ReactElement {
  const [activeMode, setActiveMode] = useState<InputMode>("file");

  function selectFileMode(): void {
    setActiveMode("file");
    scrollToConverter();
  }

  function selectUrlMode(): void {
    setActiveMode("url");
    scrollToConverter();
  }

  function scrollToConverter(): void {
    document.getElementById("converter")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:min-h-[calc(100vh-80px)] lg:grid-cols-[1fr_420px] lg:items-center lg:py-14">
        <HeroSection
          onSelectFileMode={selectFileMode}
          onSelectUrlMode={selectUrlMode}
        />
        <UploadPanel activeMode={activeMode} onModeChange={setActiveMode} />
      </div>
      <SupportedFormats />
    </main>
  );
}
