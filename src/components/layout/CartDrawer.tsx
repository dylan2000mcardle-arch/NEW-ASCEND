"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/providers/CartProvider";
import ProductThumb from "@/components/ui/ProductThumb";
import StackUpsell from "@/components/shop/StackUpsell";
import { BUNDLES } from "@/lib/quiz";

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

export default function CartDrawer() {
  const {
    items,
    isOpen,
    close,
    remove,
    replaceWith,
    checkout,
    checkingOut,
    error,
  } = useCart();

  const subtotal = items.reduce((sum, i) => {
    const amount = i.price ? Number(i.price.amount) : 0;
    return sum + amount * i.quantity;
  }, 0);
  const currency = items.find((i) => i.price)?.price?.currencyCode ?? "GBP";

  const full = BUNDLES.full;
  const hasFullStack = items.some((i) => i.handle === full.handle);
  const showUpsell = items.length > 0 && !hasFullStack;

  function swapToFullStack() {
    replaceWith({
      handle: full.handle,
      name: full.name,
      benefit: full.description,
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            aria-hidden
          />

          {/* Panel */}
          <motion.aside
            className="glass fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-glass-border bg-background/80"
            role="dialog"
            aria-label="Your cart"
            aria-modal="true"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between border-b px-6 py-5"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <h2 className="font-mono text-sm font-bold uppercase tracking-[0.3em] text-white">
                Your Stack
              </h2>
              <button
                onClick={close}
                aria-label="Close cart"
                className="cursor-pointer rounded-lg p-1 text-foreground/50 outline-none transition-colors hover:text-cyan focus-visible:ring-2 focus-visible:ring-cyan"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="font-mono text-sm uppercase tracking-[0.2em] text-foreground/40">
                    Your cart is empty
                  </p>
                  <p className="mt-2 max-w-[16rem] text-sm text-foreground/40">
                    Build your protocol with the quiz or add the stack.
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {items.map((item) => (
                    <li
                      key={item.variantId}
                      className="rounded-xl border bg-white/[0.02] px-4 py-4"
                      style={{ borderColor: "rgba(255,255,255,0.08)" }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <ProductThumb
                          handle={item.handle}
                          name={item.name}
                          image={item.image}
                          size={56}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-sm font-bold uppercase tracking-wide text-white">
                            {item.name}
                          </p>
                          {item.variantTitle && (
                            <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-cyan/70">
                              {item.variantTitle}
                            </p>
                          )}
                          <p className="mt-1 text-sm leading-snug text-foreground/50">
                            {item.benefit}
                          </p>
                          <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-foreground/40">
                            Qty {item.quantity}
                            {item.price
                              ? ` · ${formatPrice(
                                  item.price.amount,
                                  item.price.currencyCode
                                )}`
                              : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => remove(item.variantId)}
                          aria-label={`Remove ${item.name}`}
                          className="cursor-pointer shrink-0 rounded-md p-1 text-foreground/40 outline-none transition-colors hover:text-red-400 focus-visible:ring-2 focus-visible:ring-red-400/50"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          >
                            <path d="M3 6h18M8 6V4h8v2m-9 0v14h10V6" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div
                className="border-t px-6 py-5"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                {showUpsell && (
                  <div className="mb-4">
                    <StackUpsell
                      bundle={full}
                      ctaLabel="Swap to the Full Stack"
                      onUpgrade={swapToFullStack}
                      compact
                    />
                  </div>
                )}
                <div className="mb-4 flex items-center justify-between font-mono text-xs uppercase tracking-[0.2em] text-foreground/60">
                  <span>Subtotal</span>
                  <span className="text-white">
                    {formatPrice(String(subtotal), currency)}
                  </span>
                </div>
                {error && (
                  <p className="mb-3 text-center font-mono text-xs text-red-400">
                    {error}
                  </p>
                )}
                <motion.button
                  onClick={checkout}
                  disabled={checkingOut}
                  className="w-full cursor-pointer rounded-xl bg-cyan px-8 py-3.5 font-mono text-sm font-bold uppercase tracking-[0.2em] text-background outline-none transition-opacity disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  style={{ boxShadow: "0 0 30px rgba(0,243,255,0.25)" }}
                  whileHover={
                    checkingOut
                      ? {}
                      : { scale: 1.02, boxShadow: "0 0 45px rgba(0,243,255,0.5)" }
                  }
                  whileTap={checkingOut ? {} : { scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {checkingOut ? "Redirecting..." : "Checkout"}
                </motion.button>
                <ul className="mt-3 flex items-center justify-center gap-x-4 gap-y-1">
                  {["Free shipping", "30-day guarantee", "Medical-grade"].map(
                    (badge) => (
                      <li
                        key={badge}
                        className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-foreground/45"
                      >
                        <svg
                          aria-hidden
                          viewBox="0 0 20 20"
                          className="h-2.5 w-2.5 shrink-0 text-cyan"
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
                </ul>
                <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-wider text-foreground/30">
                  Secure checkout via Shopify
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
