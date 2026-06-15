"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Protocol", href: "#protocol" },
  { label: "Research", href: "#research" },
  { label: "Community", href: "#community" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-glass-border bg-background/80"
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a
          href="#"
          className="font-mono text-lg font-bold tracking-[0.3em] text-white"
        >
          <span className="text-glow-cyan text-cyan">A</span>SCND
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/40 transition-colors hover:text-cyan"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.06 }}
            >
              {link.label}
            </motion.a>
          ))}

          <motion.a
            href="#quiz"
            className="rounded-lg border border-cyan/25 bg-cyan/5 px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] text-cyan"
            whileHover={{
              borderColor: "rgba(0, 243, 255, 0.5)",
              boxShadow: "0 0 20px rgba(0, 243, 255, 0.15)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.06 }}
          >
            Get Stack
          </motion.a>
        </div>

        {/* Mobile toggle */}
        <button
          className="flex flex-col gap-1.5 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <motion.span
            className="block h-[1px] w-5 bg-foreground/60"
            animate={mobileOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
          />
          <motion.span
            className="block h-[1px] w-5 bg-foreground/60"
            animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
          />
          <motion.span
            className="block h-[1px] w-5 bg-foreground/60"
            animate={mobileOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="glass border-t border-glass-border md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-mono text-sm uppercase tracking-[0.2em] text-foreground/50"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a href="#quiz" className="mt-2 rounded-lg border border-cyan/25 bg-cyan/5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-cyan text-center" onClick={() => setMobileOpen(false)}>
                Get Stack
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
