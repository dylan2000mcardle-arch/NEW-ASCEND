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
  if (!product) return { title: "Product not found" };
  const image = product.featuredImage?.url;
  const url = `/products/${handle}`;
  return {
    title: product.title,
    description: product.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "ASCND",
      title: product.title,
      description: product.description,
      url,
      images: image ? [{ url: image, alt: product.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
