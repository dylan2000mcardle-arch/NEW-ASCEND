"use client";

import { useEffect, useState } from "react";
import { getProductMeta } from "./shopify";

/**
 * Live "buy separately" total for a bundle's member products, summed from
 * Shopify prices. Returns null until every member price resolves (or if the
 * list is empty) so callers only render a real, non-fabricated saving.
 */
export function useBundleSavings(memberHandles: string[]): number | null {
  const [partsTotal, setPartsTotal] = useState<number | null>(null);
  const key = memberHandles.join(",");

  useEffect(() => {
    if (!memberHandles.length) {
      setPartsTotal(null);
      return;
    }
    let active = true;
    setPartsTotal(null);
    Promise.all(memberHandles.map((h) => getProductMeta(h)))
      .then((metas) => {
        if (!active || metas.some((m) => !m)) return;
        setPartsTotal(metas.reduce((sum, m) => sum + Number(m!.price.amount), 0));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return partsTotal;
}
