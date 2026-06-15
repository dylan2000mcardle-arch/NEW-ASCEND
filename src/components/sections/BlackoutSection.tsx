"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassmorphismCard from "@/components/ui/GlassmorphismCard";
import HoldButton from "@/components/ui/HoldButton";
import PulseText from "@/components/ui/PulseText";

export default function BlackoutSection() {
  const [isBlackout, setIsBlackout] = useState(false);
  const [showReveal, setShowReveal] = useState(false);

  const handleActivate = useCallback(() => {
    setIsBlackout(true);
    // After blackout completes, show reveal text
    setTimeout(() => setShowReveal(true), 2800);

    // Reset after 6 seconds, then flow the user into the quiz
    setTimeout(() => {
      setShowReveal(false);
      setTimeout(() => {
        setIsBlackout(false);
        document
          .getElementById("quiz")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }, 6000);
  }, []);

  return (
    <section id="research" className="relative scroll-mt-20 py-32">
      <div className="mx-auto max-w-4xl px-6">
        {/* Section header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.4em] text-cyan/70">
            Optimized REM Recovery
          </p>
          <h2 className="mb-4 font-mono text-3xl font-bold text-white md:text-5xl">
            The ASCND <span className="text-glow-cyan text-cyan">Blackout</span>{" "}
            Mask
          </h2>
          <p className="mx-auto max-w-lg text-sm text-foreground/50">
            Total darkness reduces cortisol, eliminates facial puffiness, and
            optimizes growth hormone release for skin regeneration.
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <GlassmorphismCard>
              <h3 className="mb-2 font-mono text-sm uppercase tracking-wider text-cyan">
                Zero-G Ocular Pressure
              </h3>
              <p className="text-sm leading-relaxed text-foreground/50">
                Absolutely no pressure on the eyelids. Engineered contours
                create a pressure-free cavity, preventing any contact with the
                ocular surface during sleep.
              </p>
            </GlassmorphismCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <GlassmorphismCard>
              <h3 className="mb-2 font-mono text-sm uppercase tracking-wider text-cyan">
                Total Light Elimination
              </h3>
              <p className="text-sm leading-relaxed text-foreground/50">
                100% blackout coverage with adaptive edge sealing. No light
                leakage from any angle — true OLED-level darkness for your
                recovery environment.
              </p>
            </GlassmorphismCard>
          </motion.div>
        </div>

        {/* Interactive Blackout Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <GlassmorphismCard
            className="relative mx-auto max-w-2xl overflow-hidden py-12 text-center"
            hover={false}
          >
            <h3 className="mb-2 font-mono text-lg uppercase tracking-[0.2em] text-white">
              Experience ASCND Blackout
            </h3>
            <p className="mb-8 text-sm text-foreground/40">
              Hold to simulate optimal recovery conditions
            </p>

            <HoldButton
              label="Simulate Optimal Recovery"
              onActivate={handleActivate}
              className="mx-auto"
            />

            {/* Subtle scan lines */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,243,255,0.1) 2px, rgba(0,243,255,0.1) 3px)",
              }}
            />
          </GlassmorphismCard>
        </motion.div>
      </div>

      {/* Blackout overlay */}
      <AnimatePresence>
        {isBlackout && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          >
            <PulseText
              text="Total darkness. Optimized REM. Facial Ascension Achieved."
              visible={showReveal}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
