// Maps a single product to the most relevant stack to upsell, and exposes the
// member handles so a bundle's real "save vs buying separately" value can be
// computed live from Shopify prices — no fabricated numbers.

import { PRODUCTS, BUNDLES, type ProductId, type BundleId, type Bundle } from "./quiz";

export const HANDLE_TO_PRODUCT: Record<string, ProductId> = Object.fromEntries(
  Object.values(PRODUCTS).map((p) => [p.handle, p.id])
) as Record<string, ProductId>;

// The protocol that best fits each single product — the natural upgrade path.
const PREFERRED_BUNDLE: Record<ProductId, BundleId> = {
  mask: "presence",
  mouth: "structure",
  nose: "structure",
  insoles: "presence",
  framer: "structure",
};

/** The stack to upsell for a given product handle, or null for bundles/unknowns. */
export function upsellBundleForHandle(handle: string): Bundle | null {
  const id = HANDLE_TO_PRODUCT[handle];
  if (!id) return null;
  return BUNDLES[PREFERRED_BUNDLE[id]];
}

const BUNDLE_BY_HANDLE: Record<string, Bundle> = Object.fromEntries(
  Object.values(BUNDLES).map((b) => [b.handle, b])
);

/** The bundle a handle refers to, or null if the handle isn't a bundle. */
export function bundleByHandle(handle: string): Bundle | null {
  return BUNDLE_BY_HANDLE[handle] ?? null;
}

/** Shopify handles of the products contained in a bundle. */
export function memberHandles(bundle: Bundle): string[] {
  return bundle.productIds.map((id) => PRODUCTS[id].handle);
}

/** Display names of the products contained in a bundle. */
export function memberNames(bundle: Bundle): string[] {
  return bundle.productIds.map((id) => PRODUCTS[id].name);
}
