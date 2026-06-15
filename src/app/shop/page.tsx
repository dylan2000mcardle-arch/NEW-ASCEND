import type { Metadata } from "next";
import { getAllProducts } from "@/lib/shopify";
import ProductGrid from "@/components/shop/ProductGrid";

export const metadata: Metadata = {
  title: "Shop — ASCND",
  description:
    "Clinical-grade recovery systems. Blackout masks, structural mouth tape, and facial optimization tools.",
};

export const revalidate = 60;

export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <section className="relative min-h-svh px-6 pb-32 pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,243,255,0.05) 0%, rgba(1,1,1,0) 70%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.4em] text-cyan/70">
            The ASCND Suite
          </p>
          <h1 className="font-mono text-4xl font-bold text-white md:text-6xl">
            Shop the <span className="text-glow-cyan text-cyan">Protocol</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm text-foreground/50">
            Engineered recovery systems. Pick individual tools or build your
            full stack.
          </p>
        </div>

        <ProductGrid products={products} />
      </div>
    </section>
  );
}
