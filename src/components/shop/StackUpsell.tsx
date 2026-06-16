"use client";

import { useEffect, useState } from "react";
import { getProductMeta, type Money, type ShopifyImage } from "@/lib/shopify";
import { memberHandles, memberNames } from "@/lib/bundles";
import type { Bundle } from "@/lib/quiz";

function formatPrice(amount: number, currencyCode: string) {
  if (Number.isNaN(amount)) return "";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch {
    return `${amount} ${currencyCode}`;
  }
}

export interface UpgradeLine {
  handle: string;
  name: string;
  benefit: string;
  price?: Money;
  image?: ShopifyImage | null;
}

interface StackUpsellProps {
  bundle: Bundle;
  ctaLabel: string;
  onUpgrade: (line: UpgradeLine) => void;
  /** Compact variant for the cart drawer; default is the roomier PDP card. */
  compact?: boolean;
}

/**
 * "Better value" upsell. Pulls the bundle price and each member product's price
 * live from Shopify and shows the real saving vs buying the parts separately —
 * never a made-up number. Renders nothing until the bundle price resolves.
 */
export default function StackUpsell({
  bundle,
  ctaLabel,
  onUpgrade,
  compact = false,
}: StackUpsellProps) {
  const [price, setPrice] = useState<Money | null>(null);
  const [image, setImage] = useState<ShopifyImage | null>(null);
  const [partsTotal, setPartsTotal] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    getProductMeta(bundle.handle)
      .then((m) => {
        if (active && m) {
          setPrice(m.price);
          setImage(m.image);
        }
      })
      .catch(() => {});
    Promise.all(memberHandles(bundle).map((h) => getProductMeta(h)))
      .then((metas) => {
        if (!active || metas.some((m) => !m)) return;
        setPartsTotal(
          metas.reduce((sum, m) => sum + Number(m!.price.amount), 0)
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [bundle.handle]);

  if (!price) return null;

  const currency = price.currencyCode;
  const bundleAmount = Number(price.amount);
  const savings = partsTotal != null ? partsTotal - bundleAmount : null;
  const showSave = savings != null && savings > 0.005;

  function handleClick() {
    onUpgrade({
      handle: bundle.handle,
      name: bundle.name,
      benefit: bundle.description,
      price: price!,
      image,
    });
  }

  return (
    <div
      className={`rounded-2xl border ${compact ? "px-4 py-4" : "p-5"}`}
      style={{
        borderColor: "rgba(0,243,255,0.25)",
        backgroundColor: "rgba(0,243,255,0.05)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-cyan">
          Better value
        </p>
        {showSave && (
          <span className="shrink-0 rounded-full border border-cyan/40 bg-cyan/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyan">
            Save {formatPrice(savings!, currency)}
          </span>
        )}
      </div>

      <p
        className={`mt-2 font-mono font-bold uppercase tracking-wide text-white ${
          compact ? "text-sm" : "text-base"
        }`}
      >
        {bundle.name}
      </p>
      <p className="mt-1 text-xs leading-snug text-foreground/55">
        {memberNames(bundle).join(" · ")}
      </p>

      <div className="mt-3 flex flex-wrap items-baseline gap-2">
        <span className="font-mono text-lg text-cyan">
          {formatPrice(bundleAmount, currency)}
        </span>
        {showSave && partsTotal != null && (
          <span className="font-mono text-xs text-foreground/40 line-through">
            {formatPrice(partsTotal, currency)}
          </span>
        )}
        <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/40">
          {showSave ? "vs separately" : "one SKU"}
        </span>
      </div>

      <button
        onClick={handleClick}
        className="mt-3 w-full cursor-pointer rounded-xl border border-cyan/40 bg-cyan/10 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-cyan outline-none transition-colors hover:bg-cyan/20 focus-visible:ring-2 focus-visible:ring-cyan"
      >
        {ctaLabel}
      </button>
    </div>
  );
}
