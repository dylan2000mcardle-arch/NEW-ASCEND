"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const SEEN_KEY = "ascnd_exit_intent_seen";

/**
 * One-shot (per session) nudge that recovers leaving visitors back into the
 * quiz funnel. Desktop: fires when the pointer exits toward the top chrome.
 * Mobile fallback: a long dwell with no conversion. No fabricated discount —
 * the value is the personalized quiz + the real guarantee.
 */
export default function ExitIntentModal() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SEEN_KEY)) return;

    const fire = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      sessionStorage.setItem(SEEN_KEY, "1");
      setOpen(true);
    };

    // Desktop: cursor leaves the viewport through the top edge.
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) fire();
    };

    // Mobile fallback: engaged but not converting after a while.
    const dwell = window.setTimeout(() => {
      if (window.scrollY > window.innerHeight * 0.5) fire();
    }, 35000);

    document.addEventListener("mouseout", onMouseOut);
    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      window.clearTimeout(dwell);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
    >
      {/* Scrim — strong enough to isolate the dialog (UX: 40-60% black) */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="glass relative w-full max-w-sm rounded-2xl border border-glass-border bg-background/85 p-7 text-center backdrop-blur-xl"
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-2.5 top-2.5 flex h-10 w-10 items-center justify-center rounded-full text-foreground/40 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-cyan"
        >
          <span aria-hidden className="text-xl leading-none">
            &times;
          </span>
        </button>

        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.4em] text-cyan/70">
          Before you go
        </p>
        <h2
          id="exit-intent-title"
          className="mb-3 font-mono text-2xl font-bold text-white"
        >
          Not sure where to start?
        </h2>
        <p className="mx-auto mb-6 max-w-xs text-sm leading-relaxed text-foreground/60">
          Answer three quick questions and we&apos;ll match you to the exact
          recovery stack for how you sleep, breathe, and carry yourself.
        </p>

        <a
          href="/#quiz"
          onClick={() => setOpen(false)}
          className="inline-block w-full rounded-xl bg-cyan px-8 py-3.5 font-mono text-sm font-bold uppercase tracking-[0.2em] text-background outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          style={{ boxShadow: "0 0 30px rgba(0,243,255,0.25)" }}
        >
          Find My Stack
        </a>

        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/40">
          30-day guarantee &middot; Free shipping
        </p>
      </motion.div>
    </div>
  );
}
