import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/shopify";
import ProductDetail from "@/components/shop/ProductDetail";

export const revalidate = 60;

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return { title: "Product not found — ASCND" };
  return {
    title: `${product.title} — ASCND`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
