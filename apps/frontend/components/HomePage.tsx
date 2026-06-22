import type { ReactElement } from "react";

import { CreditSection } from "./CreditSection";
import { FaqAccordion } from "./FaqAccordion";
import { Footer } from "./Footer";
import { HeroSection } from "./HeroSection";
import { HowItWorks } from "./HowItWorks";
import { Navbar } from "./Navbar";
import { PrivacySection } from "./PrivacySection";
import { UploadArea } from "./UploadArea";

export function HomePage(): ReactElement {
  return (
    <main id="top" className="min-h-screen overflow-x-hidden bg-white text-slate-950 dark:bg-slate-950">
      <Navbar />

      {/* Hero + upload above the fold */}
      <section className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-4 pb-16 pt-12 sm:px-6">
        {/* Light-mode colour wash — hidden in dark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-[480px] overflow-hidden dark:hidden"
        >
          <div className="absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-teal-100 via-cyan-50 to-indigo-100 opacity-70 blur-3xl" />
        </div>
        <HeroSection />
        <UploadArea />
      </section>

      <HowItWorks />
      <PrivacySection />
      <FaqAccordion />
      <CreditSection />
      <Footer />
    </main>
  );
}
