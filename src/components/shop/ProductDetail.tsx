"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCart } from "@/components/providers/CartProvider";
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
            <p className="mt-4 font-mono text-xl text-cyan">
              {formatPrice(price.amount, price.currencyCode)}
            </p>

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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
