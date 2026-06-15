"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCart } from "@/components/providers/CartProvider";
import type { ShopifyProductCard } from "@/lib/shopify";

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

export default function ProductGrid({
  products,
}: {
  products: ShopifyProductCard[];
}) {
  const { add } = useCart();

  if (!products.length) {
    return (
      <p className="text-center font-mono text-sm uppercase tracking-[0.2em] text-foreground/40">
        No products available yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, i) => (
        <motion.div
          key={product.handle}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className="group flex flex-col overflow-hidden rounded-2xl border bg-white/[0.02] backdrop-blur-sm"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <Link
            href={`/products/${product.handle}`}
            className="relative block aspect-square overflow-hidden bg-white/[0.03]"
          >
            {product.featuredImage ? (
              <Image
                src={product.featuredImage.url}
                alt={product.featuredImage.altText ?? product.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-mono text-4xl text-cyan/30">
                  {product.title.charAt(0)}
                </span>
              </div>
            )}
            {!product.availableForSale && (
              <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground/60">
                Sold out
              </span>
            )}
          </Link>

          <div className="flex flex-1 flex-col p-5">
            <Link href={`/products/${product.handle}`}>
              <h3 className="font-mono text-sm font-bold uppercase tracking-wide text-white transition-colors group-hover:text-cyan">
                {product.title}
              </h3>
            </Link>
            <p className="mt-2 line-clamp-2 flex-1 text-sm leading-snug text-foreground/50">
              {product.description}
            </p>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="font-mono text-sm text-cyan">
                {formatPrice(product.price.amount, product.price.currencyCode)}
              </span>
              <motion.button
                onClick={() =>
                  add({
                    handle: product.handle,
                    name: product.title,
                    benefit: product.description,
                  })
                }
                disabled={!product.availableForSale}
                className="cursor-pointer rounded-lg border border-cyan/25 bg-cyan/5 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-cyan"
                whileHover={product.availableForSale ? { scale: 1.04 } : {}}
                whileTap={product.availableForSale ? { scale: 0.96 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                Add
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
