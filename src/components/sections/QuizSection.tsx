"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { QUESTIONS, recommendBundle, type BundleResult } from "@/lib/quiz";
import { getProductByHandle, type ShopifyProduct } from "@/lib/shopify";
import { useCart } from "@/components/providers/CartProvider";
import ProductThumb from "@/components/ui/ProductThumb";

function formatPrice(amount: string, currencyCode: string) {
  const value = Number(amount);
  if (Number.isNaN(value)) return "";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    }).format(value);
  } catch {
    return `${value} ${currencyCode}`;
  }
}

// Single-variant products carry one "Title"/"Default Title" option — not a real choice.
function hasRealOptions(p: ShopifyProduct) {
  return !(
    p.options.length === 1 &&
    p.options[0].name === "Title" &&
    p.options[0].values.length === 1
  );
}

type Phase = "intro" | "questions" | "result";

export default function QuizSection() {
  const reduceMotion = useReducedMotion();
  const { add } = useCart();
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<BundleResult | null>(null);
  const [bundle, setBundle] = useState<ShopifyProduct | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});

  const total = QUESTIONS.length;

  // Load the live bundle product (variants/options) once we have a result.
  useEffect(() => {
    if (phase !== "result" || !result) return;
    let cancelled = false;
    setBundle(null);
    getProductByHandle(result.handle)
      .then((p) => {
        if (cancelled || !p) return;
        setBundle(p);
        const dv = p.variants.find((v) => v.availableForSale) ?? p.variants[0];
        const init: Record<string, string> = {};
        dv?.selectedOptions.forEach((o) => {
          init[o.name] = o.value;
        });
        setSelected(init);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [phase, result]);

  const showOptions = bundle ? hasRealOptions(bundle) : false;

  const selectedVariant = useMemo(() => {
    if (!bundle) return null;
    return (
      bundle.variants.find((v) =>
        v.selectedOptions.every((o) => selected[o.name] === o.value)
      ) ??
      bundle.variants.find((v) => v.availableForSale) ??
      bundle.variants[0] ??
      null
    );
  }, [bundle, selected]);

  function valueAvailable(optionName: string, value: string) {
    return (
      !!bundle &&
      bundle.variants.some(
        (v) =>
          v.availableForSale &&
          v.selectedOptions.every((o) =>
            o.name === optionName
              ? o.value === value
              : selected[o.name] === o.value
          )
      )
    );
  }

  function reset() {
    setPhase("intro");
    setStep(0);
    setAnswers([]);
    setResult(null);
    setBundle(null);
    setSelected({});
  }

  function addToCart() {
    if (!result) return;
    if (bundle && selectedVariant) {
      add({
        handle: result.handle,
        name: result.name,
        benefit: result.description,
        variantId: selectedVariant.id,
        variantTitle: showOptions ? selectedVariant.title : undefined,
        price: selectedVariant.price,
        image: selectedVariant.image ?? bundle.featuredImage,
      });
    } else {
      add({
        handle: result.handle,
        name: result.name,
        benefit: result.description,
      });
    }
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
      className="relative scroll-mt-16 overflow-hidden py-12 md:py-28"
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
        {/* Page header — hidden on the result so the recommended stack + CTA sit at the top (less scroll on mobile) */}
        {phase !== "result" && (
          <div className="mb-8 text-center md:mb-12">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.4em] text-cyan/70">
              Protocol Builder
            </p>
            <h2
              id="quiz-heading"
              className="font-mono text-4xl font-bold text-white md:text-5xl"
            >
              Find Your <span className="text-glow-cyan text-cyan">Stack</span>
            </h2>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-foreground/45">
              {total} questions &middot; 30 seconds &middot; free
            </p>
          </div>
        )}

        {/* Progress bar — only during questions */}
        {phase === "questions" && (
          <div className="mb-6 md:mb-10">
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
              <p className="mx-auto mb-6 max-w-md text-center text-sm leading-relaxed text-foreground/60 md:mb-8">
                {result.description}
              </p>

              {/* Variant selectors — pick size/options before adding */}
              {showOptions && bundle && (
                <div className="mb-6 flex flex-col gap-4 md:mb-8">
                  {bundle.options.map((option) => (
                    <div key={option.name}>
                      <p className="mb-2 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-foreground/40">
                        {option.name}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {option.values.map((value) => {
                          const isSelected = selected[option.name] === value;
                          const inStock = valueAvailable(option.name, value);
                          return (
                            <button
                              key={value}
                              onClick={() =>
                                setSelected((prev) => ({
                                  ...prev,
                                  [option.name]: value,
                                }))
                              }
                              disabled={!inStock}
                              aria-pressed={isSelected}
                              className="cursor-pointer rounded-lg border px-4 py-2 font-mono text-xs uppercase tracking-wide text-white outline-none transition-colors disabled:cursor-not-allowed disabled:text-foreground/25 disabled:line-through focus-visible:ring-2 focus-visible:ring-cyan"
                              style={{
                                borderColor: isSelected
                                  ? "rgba(0,243,255,0.6)"
                                  : "rgba(255,255,255,0.12)",
                                backgroundColor: isSelected
                                  ? "rgba(0,243,255,0.08)"
                                  : "rgba(255,255,255,0.02)",
                              }}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedVariant && (
                <div className="mb-6 flex flex-wrap items-baseline justify-center gap-3">
                  <p className="font-mono text-2xl font-bold text-cyan">
                    {formatPrice(
                      selectedVariant.price.amount,
                      selectedVariant.price.currencyCode
                    )}
                  </p>
                  {selectedVariant.compareAtPrice &&
                    Number(selectedVariant.compareAtPrice.amount) >
                      Number(selectedVariant.price.amount) && (
                      <>
                        <p className="font-mono text-base text-foreground/40 line-through">
                          {formatPrice(
                            selectedVariant.compareAtPrice.amount,
                            selectedVariant.compareAtPrice.currencyCode
                          )}
                        </p>
                        <span className="rounded-full border border-cyan/30 bg-cyan/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyan">
                          Save{" "}
                          {formatPrice(
                            (
                              Number(selectedVariant.compareAtPrice.amount) -
                              Number(selectedVariant.price.amount)
                            ).toFixed(2),
                            selectedVariant.price.currencyCode
                          )}
                        </span>
                      </>
                    )}
                </div>
              )}

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <motion.button
                  onClick={addToCart}
                  disabled={!!bundle && !selectedVariant?.availableForSale}
                  className="cursor-pointer rounded-xl bg-cyan px-8 py-3.5 font-mono text-sm font-bold uppercase tracking-[0.2em] text-background outline-none transition-opacity disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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

              {/* What's inside — compact 2-col grid below the CTA; supporting detail, kept short so the full result is viewable with minimal scroll on mobile */}
              <p className="mb-3 mt-6 text-center font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/40 md:mt-10">
                What&apos;s Inside
              </p>
              <ul className="grid grid-cols-2 gap-2">
                {result.products.map((product, i) => (
                  <motion.li
                    key={product.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.3 }}
                    className="flex items-center gap-2.5 rounded-lg border bg-white/[0.02] px-3 py-2.5"
                    style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
                  >
                    <ProductThumb handle={product.handle} name={product.name} size={36} />
                    <span className="min-w-0 truncate font-mono text-[11px] font-bold uppercase tracking-wide text-white">
                      {product.name}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
