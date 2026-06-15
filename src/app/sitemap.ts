import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/shopify";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://new-ascend.vercel.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getAllProducts();
    productRoutes = products.map((p) => ({
      url: `${SITE_URL}/products/${p.handle}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // If Shopify is unreachable at build time, ship the static routes only.
  }

  return [...staticRoutes, ...productRoutes];
}
