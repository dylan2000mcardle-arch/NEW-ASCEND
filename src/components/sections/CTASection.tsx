"use client";

import { motion } from "framer-motion";
import { useCart } from "@/components/providers/CartProvider";
import { PRODUCTS } from "@/lib/quiz";

export default function CTASection() {
  const { add, addMany } = useCart();

  function getStack() {
    addMany([
      {
        handle: PRODUCTS.mask.handle,
        name: PRODUCTS.mask.name,
        benefit: PRODUCTS.mask.benefit,
      },
      {
        handle: PRODUCTS.mouth.handle,
        name: PRODUCTS.mouth.name,
        benefit: PRODUCTS.mouth.benefit,
      },
    ]);
  }

  function maskOnly() {
    add({
      handle: PRODUCTS.mask.handle,
      name: PRODUCTS.mask.name,
      benefit: PRODUCTS.mask.benefit,
    });
  }

  return (
    <section className="relative overflow-hidden py-32">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan/5 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.4em] text-cyan/70">
            Initialize Your Protocol
          </p>
          <h2 className="mb-6 font-mono text-4xl font-bold text-white md:text-6xl">
            Ready to{" "}
            <span className="text-glow-cyan text-cyan">Ascend</span>?
          </h2>
          <p className="mx-auto mb-10 max-w-md text-sm leading-relaxed text-foreground/50">
            The ASCND Optimized Recovery Suite — Blackout Mask + Structural
            Mouth Tape. Engineered for those who refuse to settle.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <motion.button
              onClick={getStack}
              className="cursor-pointer rounded-xl border border-cyan bg-cyan/15 px-10 py-4 font-mono text-sm uppercase tracking-[0.2em] text-cyan outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 40px rgba(0, 243, 255, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.06 }}
            >
              Get the Stack
            </motion.button>

            <motion.button
              onClick={maskOnly}
              className="cursor-pointer rounded-xl border px-10 py-4 font-mono text-sm uppercase tracking-[0.2em] text-foreground/70 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              style={{ borderColor: "rgba(255, 255, 255, 0.15)" }}
              whileHover={{
                scale: 1.03,
                borderColor: "rgba(255, 255, 255, 0.35)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.06 }}
            >
              Mask Only
            </motion.button>
          </div>

          {/* Trust signals */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            {[
              "Free Shipping",
              "30-Day Protocol Guarantee",
              "Medical-Grade Materials",
            ].map((signal) => (
              <span
                key={signal}
                className="font-mono text-[10px] uppercase tracking-wider text-foreground/25"
              >
                {signal}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
