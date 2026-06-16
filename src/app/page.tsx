import HeroSection from "@/components/sections/HeroSection";
import JawTransformSection from "@/components/sections/JawTransformSection";
import BlackoutSection from "@/components/sections/BlackoutSection";
import SocialProofSection from "@/components/sections/SocialProofSection";
import QuizSection from "@/components/sections/QuizSection";
import FAQSection from "@/components/sections/FAQSection";
import CTASection from "@/components/sections/CTASection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <JawTransformSection />
      <BlackoutSection />
      <SocialProofSection />
      <QuizSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
