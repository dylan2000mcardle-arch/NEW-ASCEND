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
  type ShopifyImage,
} from "@/lib/shopify";

export interface CartLineInput {
  handle: string;
  name: string;
  benefit: string;
}

export interface CartItem extends CartLineInput {
  quantity: number;
  price?: { amount: string; currencyCode: string };
  image?: ShopifyImage | null;
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
  remove: (handle: string) => void;
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

  const fetchMeta = useCallback((handle: string) => {
    getProductMeta(handle)
      .then((m) => {
        if (!m) return;
        setItems((prev) =>
          prev.map((i) =>
            i.handle === handle ? { ...i, price: m.price, image: m.image } : i
          )
        );
      })
      .catch(() => {});
  }, []);

  const addOne = useCallback(
    (line: CartLineInput) => {
      let isNew = false;
      setItems((prev) => {
        const existing = prev.find((i) => i.handle === line.handle);
        if (existing) {
          return prev.map((i) =>
            i.handle === line.handle ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        isNew = true;
        return [...prev, { ...line, quantity: 1 }];
      });
      if (isNew) fetchMeta(line.handle);
    },
    [fetchMeta]
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

  const remove = useCallback((handle: string) => {
    setItems((prev) => prev.filter((i) => i.handle !== handle));
  }, []);

  const checkout = useCallback(async () => {
    if (!items.length) return;
    setCheckingOut(true);
    setError(null);
    try {
      const variants = await Promise.all(
        items.map((i) => getProductVariant(i.handle))
      );
      const lines = variants
        .map((v, idx) =>
          v ? { variantId: v.id, quantity: items[idx].quantity } : null
        )
        .filter((l): l is { variantId: string; quantity: number } => l !== null);
      if (!lines.length) throw new Error("No products found in Shopify.");
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
