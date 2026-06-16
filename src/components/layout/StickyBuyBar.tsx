"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "@/components/providers/CartProvider";

/**
 * Mobile-only persistent CTA. Appears once the user scrolls past the hero so
 * the primary conversion path ("Find Your Stack") is always one tap away
 * without scrolling back up. Homepage only — that's where the #quiz anchor
 * lives. Hidden while the cart drawer is open to avoid stacked overlays.
 */
export default function StickyBuyBar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { isOpen } = useCart();
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setPastHero(window.scrollY > window.innerHeight * 0.7);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  if (pathname !== "/") return null;

  const visible = pastHero && !isOpen;

  return (
    <motion.div
      initial={false}
      animate={visible ? { y: 0, opacity: 1 } : { y: 120, opacity: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 400, damping: 34 }
      }
      className={`fixed inset-x-0 bottom-0 z-30 md:hidden ${
        visible ? "" : "pointer-events-none"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-hidden={!visible}
    >
      <div className="glass mx-3 mb-3 flex items-center justify-between gap-3 rounded-2xl border border-glass-border bg-background/80 px-4 py-3 backdrop-blur-xl">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan/70">
            Free shipping &middot; 30-day guarantee
          </p>
          <p className="truncate font-mono text-sm font-bold text-white">
            Build your recovery stack
          </p>
        </div>
        <a
          href="/#quiz"
          tabIndex={visible ? 0 : -1}
          className="inline-flex min-h-[44px] shrink-0 items-center rounded-xl bg-cyan px-5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-background outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          style={{ boxShadow: "0 0 24px rgba(0,243,255,0.3)" }}
        >
          Find Your Stack
        </a>
      </div>
    </motion.div>
  );
}
