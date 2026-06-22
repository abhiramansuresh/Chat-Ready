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
    <main id="top" className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950 dark:bg-slate-950">
      <Navbar />

      {/* Hero + upload above the fold */}
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-4 pb-16 pt-12 sm:px-6">
        <HeroSection />
        <div className="w-full max-w-2xl">
          <UploadArea />
        </div>
      </section>

      <HowItWorks />
      <PrivacySection />
      <FaqAccordion />
      <CreditSection />
      <Footer />
    </main>
  );
}
