"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCart } from "@/components/providers/CartProvider";
import StackUpsell from "@/components/shop/StackUpsell";
import { upsellBundleForHandle, bundleByHandle, memberHandles } from "@/lib/bundles";
import { useBundleSavings } from "@/lib/useBundleSavings";
import type { ShopifyProduct } from "@/lib/shopify";

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

// Shopify single-variant products carry one option named "Title" with value
// "Default Title" — that's not a real choice, so don't render a selector for it.
function hasRealOptions(product: ShopifyProduct) {
  return !(
    product.options.length === 1 &&
    product.options[0].name === "Title" &&
    product.options[0].values.length === 1
  );
}

export default function ProductDetail({ product }: { product: ShopifyProduct }) {
  const { add } = useCart();
  const gallery = product.images.length
    ? product.images
    : product.featuredImage
      ? [product.featuredImage]
      : [];
  const [active, setActive] = useState(0);
  const current = gallery[active] ?? null;

  const showOptions = hasRealOptions(product);
  const upsellBundle = upsellBundleForHandle(product.handle);

  // If this product is itself a bundle, show its real saving vs buying the
  // members separately (bundle SKUs can't carry a compare-at price in Shopify).
  const selfBundle = bundleByHandle(product.handle);
  const partsTotal = useBundleSavings(
    selfBundle ? memberHandles(selfBundle) : []
  );

  // Default selection = the first available variant, else the first variant.
  const defaultVariant =
    product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    defaultVariant?.selectedOptions.forEach((o) => {
      init[o.name] = o.value;
    });
    return init;
  });

  const selectedVariant = useMemo(
    () =>
      product.variants.find((v) =>
        v.selectedOptions.every((o) => selected[o.name] === o.value)
      ) ?? defaultVariant,
    [product.variants, selected, defaultVariant]
  );

  // Which option values lead to an in-stock variant given the rest of the selection.
  function valueAvailable(optionName: string, value: string) {
    return product.variants.some(
      (v) =>
        v.availableForSale &&
        v.selectedOptions.every((o) =>
          o.name === optionName ? o.value === value : selected[o.name] === o.value
        )
    );
  }

  const price = selectedVariant?.price ?? product.price;
  const compareAt = selectedVariant?.compareAtPrice ?? null;
  const onSale =
    !!compareAt && Number(compareAt.amount) > Number(price.amount);
  const savings = onSale
    ? (Number(compareAt!.amount) - Number(price.amount)).toFixed(2)
    : null;
  const available = selectedVariant?.availableForSale ?? product.availableForSale;

  function addToCart() {
    if (!selectedVariant) return;
    add({
      handle: product.handle,
      name: product.title,
      benefit: product.description,
      variantId: selectedVariant.id,
      variantTitle: showOptions ? selectedVariant.title : undefined,
      price: selectedVariant.price,
      image: selectedVariant.image ?? current ?? product.featuredImage,
    });
  }

  return (
    <section className="relative min-h-svh px-6 pb-32 pt-28">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/shop"
          className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-foreground/40 transition-colors hover:text-cyan"
        >
          <span aria-hidden>&larr;</span> Back to shop
        </Link>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Gallery */}
          <div>
            <div
              className="relative aspect-square overflow-hidden rounded-2xl border bg-white/[0.03]"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              {current ? (
                <Image
                  src={current.url}
                  alt={current.altText ?? product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-mono text-6xl text-cyan/30">
                    {product.title.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="mt-4 flex gap-3">
                {gallery.map((img, i) => (
                  <button
                    key={img.url}
                    onClick={() => setActive(i)}
                    aria-label={`View image ${i + 1}`}
                    className="relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan"
                    style={{
                      borderColor:
                        i === active
                          ? "rgba(0,243,255,0.6)"
                          : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText ?? `${product.title} ${i + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h1 className="font-mono text-3xl font-bold text-white md:text-4xl">
              {product.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <p className="font-mono text-xl text-cyan">
                {formatPrice(price.amount, price.currencyCode)}
              </p>
              {onSale && (
                <>
                  <p className="font-mono text-sm text-foreground/40 line-through">
                    {formatPrice(compareAt!.amount, compareAt!.currencyCode)}
                  </p>
                  <span className="rounded-full border border-cyan/30 bg-cyan/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyan">
                    Save {formatPrice(savings!, price.currencyCode)}
                  </span>
                </>
              )}
              {!onSale &&
                partsTotal != null &&
                partsTotal > Number(price.amount) && (
                  <>
                    <p className="font-mono text-sm text-foreground/40 line-through">
                      {formatPrice(String(partsTotal), price.currencyCode)}
                    </p>
                    <span className="rounded-full border border-cyan/30 bg-cyan/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyan">
                      Save{" "}
                      {formatPrice(
                        (partsTotal - Number(price.amount)).toFixed(2),
                        price.currencyCode
                      )}{" "}
                      vs separately
                    </span>
                  </>
                )}
            </div>

            {product.descriptionHtml ? (
              <div
                className="mt-6 max-w-prose text-sm leading-relaxed text-foreground/60 [&_a]:text-cyan [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-3"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            ) : (
              <p className="mt-6 max-w-prose text-sm leading-relaxed text-foreground/60">
                {product.description}
              </p>
            )}

            {/* Variant selectors */}
            {showOptions && (
              <div className="mt-8 flex flex-col gap-5">
                {product.options.map((option) => (
                  <div key={option.name}>
                    <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-foreground/40">
                      {option.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
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

            <div className="mt-8">
              <motion.button
                onClick={addToCart}
                disabled={!available}
                className="w-full cursor-pointer rounded-xl bg-cyan px-8 py-4 font-mono text-sm font-bold uppercase tracking-[0.2em] text-background outline-none transition-opacity disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
                style={{ boxShadow: "0 0 30px rgba(0,243,255,0.25)" }}
                whileHover={
                  available
                    ? { scale: 1.02, boxShadow: "0 0 45px rgba(0,243,255,0.5)" }
                    : {}
                }
                whileTap={available ? { scale: 0.98 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {available ? "Add to Cart" : "Sold Out"}
              </motion.button>

              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {["Free shipping", "30-day guarantee", "Medical-grade"].map(
                  (badge) => (
                    <li
                      key={badge}
                      className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60"
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
              </ul>

              {upsellBundle && (
                <div className="mt-6">
                  <StackUpsell
                    bundle={upsellBundle}
                    ctaLabel={`Upgrade to ${upsellBundle.name}`}
                    onUpgrade={(line) => add(line)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
