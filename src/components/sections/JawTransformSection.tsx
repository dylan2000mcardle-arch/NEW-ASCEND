"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";

const JawScene = dynamic(() => import("./JawScene"), { ssr: false });

export default function JawTransformSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [morphProgress, setMorphProgress] = useState(0);
  const [tapeVisible, setTapeVisible] = useState(false);
  const [tapeAttach, setTapeAttach] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Map scroll to morph and tape states
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      const morph = Math.min(Math.max((v - 0.3) / 0.3, 0), 1);
      setMorphProgress(morph);

      setTapeVisible(v > 0.4);
      const tape = Math.min(Math.max((v - 0.4) / 0.2, 0), 1);
      setTapeAttach(tape);
    });
    return unsubscribe;
  }, [scrollYProgress]);

  const textOpacity = useTransform(scrollYProgress, [0.2, 0.35], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.2, 0.35], [40, 0]);

  return (
    <section id="protocol" ref={sectionRef} className="relative scroll-mt-20 py-20 md:py-32">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-6 md:gap-12 lg:grid-cols-2">
        {/* Text content — shown first on mobile, second on desktop */}
        <motion.div
          className="order-1 flex flex-col justify-center lg:order-2"
          style={{ opacity: textOpacity, y: textY }}
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.4em] text-cyan/70">
            Maxillofacial Structural Bio-hacking
          </p>
          <h2 className="mb-6 font-mono text-3xl font-bold text-white md:text-5xl">
            Redefine Your
            <br />
            <span className="text-glow-cyan text-cyan">Structure</span>
          </h2>
          <p className="mb-8 max-w-md text-sm leading-relaxed text-foreground/60 md:text-base">
            Force nasal breathing to define the jawline, prevent structural
            degradation, and optimize overall facial balance. Medical-grade
            adhesion — breathable, irritation-free.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {[
              "Nasal Breathing Lock",
              "Medical-Grade Adhesion",
              "Zero Irritation",
              "Structural Remodeling",
            ].map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-cyan/15 bg-cyan/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider text-cyan/80"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Metric cards */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="glass rounded-xl p-4">
              <p className="font-mono text-2xl font-bold text-cyan">94%</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-foreground/40">
                Nasal Breathing Compliance
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="font-mono text-2xl font-bold text-cyan">+2.3</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-foreground/40">
                Avg. Jaw Definition Score
              </p>
            </div>
          </div>
        </motion.div>

        {/* 3D Canvas — shown second on mobile, first on desktop */}
        <div className="relative order-2 mx-auto h-64 w-full max-w-md md:h-80 lg:order-1 lg:h-auto lg:aspect-square lg:mx-0">
          <JawScene
            morphProgress={morphProgress}
            tapeVisible={tapeVisible}
            tapeAttach={tapeAttach}
          />
        </div>
      </div>
    </section>
  );
}
