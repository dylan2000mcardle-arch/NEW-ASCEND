"use client";

import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import DeviceProvider from "@/components/providers/DeviceProvider";
import Navigation from "@/components/layout/Navigation";
import ScrollProgress from "@/components/layout/ScrollProgress";
import HeroSection from "@/components/sections/HeroSection";
import JawTransformSection from "@/components/sections/JawTransformSection";
import BlackoutSection from "@/components/sections/BlackoutSection";
import SocialProofSection from "@/components/sections/SocialProofSection";
import QuizSection from "@/components/sections/QuizSection";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <DeviceProvider>
      <SmoothScrollProvider>
        <ScrollProgress />
        <Navigation />
        <main>
          <HeroSection />
          <JawTransformSection />
          <BlackoutSection />
          <SocialProofSection />
          <div id="quiz"><QuizSection /></div>
          <CTASection />
        </main>
        <Footer />
      </SmoothScrollProvider>
    </DeviceProvider>
  );
}
