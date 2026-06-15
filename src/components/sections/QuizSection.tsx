"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { QUESTIONS, recommendBundle, type BundleResult } from "@/lib/quiz";
import { useCart } from "@/components/providers/CartProvider";
import ProductThumb from "@/components/ui/ProductThumb";

type Phase = "intro" | "questions" | "result";

export default function QuizSection() {
  const reduceMotion = useReducedMotion();
  const { addMany } = useCart();
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<BundleResult | null>(null);

  const total = QUESTIONS.length;

  function reset() {
    setPhase("intro");
    setStep(0);
    setAnswers([]);
    setResult(null);
  }

  function addToCart() {
    if (!result) return;
    addMany(
      result.products.map((p) => ({
        handle: p.handle,
        name: p.name,
        benefit: p.benefit,
      }))
    );
  }

  function answer(optionIndex: number) {
    const next = [...answers];
    next[step] = optionIndex;
    setAnswers(next);

    if (step + 1 < total) {
      setStep(step + 1);
    } else {
      setResult(recommendBundle(next));
      setPhase("result");
    }
  }

  function back() {
    if (step === 0) {
      setPhase("intro");
    } else {
      setStep(step - 1);
    }
  }

  const contentKey =
    phase === "questions" ? `q-${step}` : phase;
  const enter = reduceMotion ? false : { opacity: 0, y: 24 };

  return (
    <section
      id="quiz"
      className="relative overflow-hidden py-32"
      aria-labelledby="quiz-heading"
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(0,243,255,0.06) 0%, rgba(1,1,1,0) 70%)",
        }}
      />

      <div className="relative mx-auto max-w-2xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.4em] text-cyan/70">
            Protocol Builder
          </p>
          <h2
            id="quiz-heading"
            className="font-mono text-4xl font-bold text-white md:text-5xl"
          >
            Find Your <span className="text-glow-cyan text-cyan">Stack</span>
          </h2>
        </div>

        {/* Progress bar — only during questions */}
        {phase === "questions" && (
          <div className="mb-10">
            <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/40">
              <span>
                Step {step + 1} of {total}
              </span>
              <span>{Math.round(((step + 1) / total) * 100)}%</span>
            </div>
            <div className="h-px w-full bg-white/10">
              <motion.div
                className="h-px bg-cyan"
                initial={false}
                animate={{ width: `${((step + 1) / total) * 100}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
                style={{ boxShadow: "0 0 8px rgba(0,243,255,0.6)" }}
              />
            </div>
          </div>
        )}

        <motion.div
          key={contentKey}
          initial={enter}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* INTRO */}
          {phase === "intro" ? (
            <div
              className="rounded-2xl border bg-white/[0.02] p-8 text-center backdrop-blur-sm md:p-12"
              style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
            >
              <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-foreground/60">
                Answer three questions. We&apos;ll match you to the recovery
                stack built for how you sleep, breathe, and carry yourself.
              </p>
              <motion.button
                onClick={() => setPhase("questions")}
                className="cursor-pointer rounded-xl bg-cyan px-8 py-3.5 font-mono text-sm font-bold uppercase tracking-[0.2em] text-background outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                style={{ boxShadow: "0 0 30px rgba(0,243,255,0.25)" }}
                whileHover={{ scale: 1.03, boxShadow: "0 0 45px rgba(0,243,255,0.5)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                Start
              </motion.button>
            </div>
          ) : phase === "questions" ? (
            /* QUESTIONS */
            <div>
              <h3 className="mb-6 text-center font-mono text-2xl font-bold text-white md:text-3xl">
                {QUESTIONS[step].prompt}
              </h3>

              <div className="flex flex-col gap-3">
                {QUESTIONS[step].options.map((option, i) => {
                  const selected = answers[step] === i;
                  return (
                    <motion.button
                      key={option.label}
                      onClick={() => answer(i)}
                      className="group cursor-pointer rounded-xl border bg-white/[0.02] px-5 py-4 text-left outline-none backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      style={{
                        borderColor: selected
                          ? "rgba(0, 243, 255, 0.5)"
                          : "rgba(255, 255, 255, 0.08)",
                      }}
                      whileHover={{
                        scale: 1.01,
                        borderColor: "rgba(0, 243, 255, 0.4)",
                      }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <span className="block font-mono text-sm font-bold uppercase tracking-wide text-white transition-colors group-hover:text-cyan">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-sm text-foreground/50">
                        {option.detail}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <button
                onClick={back}
                className="mt-6 cursor-pointer font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/40 outline-none transition-colors hover:text-foreground/70 focus-visible:text-foreground/70"
              >
                Back
              </button>
            </div>
          ) : result ? (
            /* RESULT */
            <div
              className="rounded-2xl border bg-white/[0.02] p-8 backdrop-blur-sm md:p-10"
              style={{ borderColor: "rgba(0, 243, 255, 0.2)" }}
            >
              <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-[0.4em] text-cyan/70">
                Your Recommended Stack
              </p>
              <h3 className="mb-3 text-center font-mono text-3xl font-bold text-glow-cyan text-cyan md:text-4xl">
                {result.name}
              </h3>
              <p className="mx-auto mb-8 max-w-md text-center text-sm leading-relaxed text-foreground/60">
                {result.description}
              </p>

              <ul className="mb-8 flex flex-col gap-3">
                {result.products.map((product, i) => (
                  <motion.li
                    key={product.id}
                    initial={reduceMotion ? false : { opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.3 }}
                    className="flex items-center gap-4 rounded-xl border bg-white/[0.02] px-5 py-4"
                    style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
                  >
                    <ProductThumb handle={product.handle} name={product.name} size={48} />
                    <div className="min-w-0">
                      <span className="block font-mono text-sm font-bold uppercase tracking-wide text-white">
                        {product.name}
                      </span>
                      <span className="mt-1 block text-sm text-foreground/50">
                        {product.benefit}
                      </span>
                    </div>
                  </motion.li>
                ))}
              </ul>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <motion.button
                  onClick={addToCart}
                  className="cursor-pointer rounded-xl bg-cyan px-8 py-3.5 font-mono text-sm font-bold uppercase tracking-[0.2em] text-background outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  style={{ boxShadow: "0 0 30px rgba(0,243,255,0.25)" }}
                  whileHover={{ scale: 1.03, boxShadow: "0 0 45px rgba(0,243,255,0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  Add Bundle to Cart
                </motion.button>
                <button
                  onClick={reset}
                  className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/40 outline-none transition-colors hover:text-foreground/70 focus-visible:text-foreground/70"
                >
                  Start Over
                </button>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
