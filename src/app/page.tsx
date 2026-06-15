"use client";

import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import DeviceProvider from "@/components/providers/DeviceProvider";
import CartProvider from "@/components/providers/CartProvider";
import Navigation from "@/components/layout/Navigation";
import CartDrawer from "@/components/layout/CartDrawer";
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
        <CartProvider>
          <ScrollProgress />
          <Navigation />
          <CartDrawer />
          <main>
            <HeroSection />
            <JawTransformSection />
            <BlackoutSection />
            <SocialProofSection />
            <QuizSection />
            <CTASection />
          </main>
          <Footer />
        </CartProvider>
      </SmoothScrollProvider>
    </DeviceProvider>
  );
}
