"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export default function HeroSection() {
  const reduceMotion = useReducedMotion();
  // Desktop-only 3D. Mobile gets a static gradient so the Three.js bundle is
  // never downloaded — ad traffic is mostly phones and the 3D scene was the
  // primary cause of slow first paint / high bounce. Starts false so the
  // dynamic import only fires once we've confirmed a non-mobile device.
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    const mobile =
      window.innerWidth < 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    if (!mobile) setShow3D(true);
  }, []);

  return (
    <section className="relative flex min-h-svh items-center justify-center overflow-hidden">
      {/* 3D Canvas — desktop only; mobile gets a static gradient (no Three.js) */}
      <div className="absolute inset-0">
        {show3D ? (
          <HeroScene />
        ) : (
          <div
            aria-hidden
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(120% 80% at 50% 0%, rgba(0,243,255,0.18) 0%, rgba(0,168,179,0.08) 30%, rgba(1,1,1,0) 65%), #010101",
            }}
          />
        )}
      </div>

      {/* Legibility scrim — keeps text readable over the liquid-glass scene */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(1,1,1,0.72) 0%, rgba(1,1,1,0.45) 45%, rgba(1,1,1,0) 80%)",
        }}
      />

      {/* Text overlay */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.4em] text-cyan/80">
            The Overnight Recovery Stack
          </p>
          <h1 className="mb-6 font-mono text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl lg:text-8xl">
            <span className="text-glow-cyan">ASCND</span>
          </h1>
          <p className="mx-auto max-w-xl font-sans text-base leading-relaxed text-foreground/75 md:text-lg">
            Sharper jawline. Deeper sleep. Taller presence. One overnight
            recovery stack. Sleep on it, wake up optimized.
          </p>
        </motion.div>

        <motion.div
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {/* Primary CTA */}
          <motion.a
            href="#quiz"
            className="cursor-pointer rounded-xl bg-cyan px-8 py-3.5 font-mono text-sm font-bold uppercase tracking-[0.2em] text-background shadow-[0_0_30px_rgba(0,243,255,0.25)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            whileHover={{
              scale: 1.03,
              boxShadow: "0 0 45px rgba(0, 243, 255, 0.5)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            Find Your Stack
          </motion.a>

          {/* Secondary CTA */}
          <motion.a
            href="#research"
            className="cursor-pointer rounded-xl border px-8 py-3.5 font-mono text-sm uppercase tracking-[0.2em] text-foreground/70 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            style={{ borderColor: "rgba(255, 255, 255, 0.15)" }}
            whileHover={{
              scale: 1.03,
              borderColor: "rgba(255, 255, 255, 0.35)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            View Research
          </motion.a>
        </motion.div>

        <motion.ul
          className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          {["Free shipping", "30-day guarantee", "Medical-grade"].map(
            (badge) => (
              <li
                key={badge}
                className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/70"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 20 20"
                  className="h-3.5 w-3.5 shrink-0 text-cyan"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.79 6.8-6.79a1 1 0 0 1 1.4 0Z"
                    clipRule="evenodd"
                  />
                </svg>
                {badge}
              </li>
            )
          )}
        </motion.ul>
      </div>

      {/* Scroll indicator — anchored to the section, not the text block */}
      <motion.div
        className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/40">
            Scroll
          </span>
          <div className="h-8 w-px bg-gradient-to-b from-cyan/50 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
