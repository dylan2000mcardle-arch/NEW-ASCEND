"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  getProductVariant,
  getProductMeta,
  createCheckout,
  type Money,
  type ShopifyImage,
} from "@/lib/shopify";

export interface CartLineInput {
  handle: string;
  name: string;
  benefit: string;
  /** Explicit Shopify variant id (from a variant selector). */
  variantId?: string;
  /** Human-readable variant label, e.g. "7.5cm". Omitted for single-variant products. */
  variantTitle?: string;
  price?: Money;
  image?: ShopifyImage | null;
}

export interface CartItem extends CartLineInput {
  /** Resolved Shopify variant id — the cart line key. */
  variantId: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  isOpen: boolean;
  checkingOut: boolean;
  error: string | null;
  open: () => void;
  close: () => void;
  add: (line: CartLineInput) => void;
  addMany: (lines: CartLineInput[]) => void;
  remove: (variantId: string) => void;
  checkout: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fill in missing image (and price, if not already set) for a line.
  const fetchMeta = useCallback((handle: string, variantId: string) => {
    getProductMeta(handle)
      .then((m) => {
        if (!m) return;
        setItems((prev) =>
          prev.map((i) =>
            i.variantId === variantId
              ? { ...i, price: i.price ?? m.price, image: i.image ?? m.image }
              : i
          )
        );
      })
      .catch(() => {});
  }, []);

  // Insert/increment a line that already has a resolved variantId.
  const addResolved = useCallback(
    (line: CartLineInput & { variantId: string }) => {
      let isNew = false;
      setItems((prev) => {
        const existing = prev.find((i) => i.variantId === line.variantId);
        if (existing) {
          return prev.map((i) =>
            i.variantId === line.variantId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }
        isNew = true;
        return [...prev, { ...line, quantity: 1 }];
      });
      if (isNew && (!line.price || line.image === undefined)) {
        fetchMeta(line.handle, line.variantId);
      }
    },
    [fetchMeta]
  );

  const addOne = useCallback(
    (line: CartLineInput) => {
      if (line.variantId) {
        addResolved({ ...line, variantId: line.variantId });
        return;
      }
      // No explicit variant (e.g. quiz) — resolve the default/first variant.
      getProductVariant(line.handle)
        .then((v) => {
          if (!v) return;
          addResolved({ ...line, variantId: v.id, price: line.price ?? v.price });
        })
        .catch(() => {});
    },
    [addResolved]
  );

  const add = useCallback(
    (line: CartLineInput) => {
      addOne(line);
      setError(null);
      setIsOpen(true);
    },
    [addOne]
  );

  const addMany = useCallback(
    (lines: CartLineInput[]) => {
      lines.forEach(addOne);
      setError(null);
      setIsOpen(true);
    },
    [addOne]
  );

  const remove = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const checkout = useCallback(async () => {
    if (!items.length) return;
    setCheckingOut(true);
    setError(null);
    try {
      const lines = items.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
      }));
      const url = await createCheckout(lines);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setCheckingOut(false);
    }
  }, [items]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        isOpen,
        checkingOut,
        error,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        add,
        addMany,
        remove,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
