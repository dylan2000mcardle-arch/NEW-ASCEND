"use client";

import { useEffect, useMemo, useState } from "react";
import { getProductVariants, type VariantPrice } from "./shopify";

/**
 * Variant-aware "buy separately" total for a bundle's member products.
 *
 * Bundle SKUs in Shopify aggregate per-member options under a single product,
 * so when a bundle variant differs in price (e.g. Insoles 7.5cm costs more
 * than 3cm), the parts total must reflect the matching member variant — not
 * just the cheapest one. We pick each member's variant whose option values
 * have the best substring overlap with the bundle's selected option values.
 *
 * Returns null until every member's variants resolve so callers only render a
 * real saving — never a fabricated number.
 */
export function useBundleSavings(
  memberHandles: string[],
  selectedValues: string[] = []
): number | null {
  const [memberVariants, setMemberVariants] = useState<VariantPrice[][] | null>(
    null
  );
  const memberKey = memberHandles.join(",");

  useEffect(() => {
    if (!memberHandles.length) {
      setMemberVariants(null);
      return;
    }
    let active = true;
    setMemberVariants(null);
    Promise.all(memberHandles.map((h) => getProductVariants(h)))
      .then((results) => {
        if (!active) return;
        if (results.some((r) => !r || !r.length)) {
          setMemberVariants(null);
          return;
        }
        setMemberVariants(results as VariantPrice[][]);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberKey]);

  const selectedKey = selectedValues.join("|");

  return useMemo(() => {
    if (!memberVariants) return null;
    const norm = (s: string) => s.toLowerCase().trim();
    const bundleVals = selectedValues.map(norm).filter((v) => v.length > 0);

    return memberVariants.reduce((sum, variants) => {
      if (variants.length === 1) {
        return sum + Number(variants[0].price.amount);
      }
      // Pick the variant whose option values overlap most with the bundle's
      // selected values. Ties broken by the first match found. Falls back to
      // the first available variant when nothing matches.
      let best = variants.find((v) => v.availableForSale) ?? variants[0];
      let bestScore = -1;
      for (const v of variants) {
        let score = 0;
        for (const opt of v.selectedOptions) {
          const ov = norm(opt.value);
          if (!ov || ov === "default title") continue;
          for (const bv of bundleVals) {
            if (bv === ov || bv.includes(ov) || ov.includes(bv)) {
              score++;
              break;
            }
          }
        }
        if (score > bestScore) {
          bestScore = score;
          best = v;
        }
      }
      return sum + Number(best.price.amount);
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberVariants, selectedKey]);
}
