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
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 pb-12 pt-10 sm:px-6 lg:min-h-[calc(100vh-4rem)] lg:justify-center lg:pb-16 lg:pt-12">
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
