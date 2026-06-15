"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getProductMeta, type ShopifyImage } from "@/lib/shopify";

interface ProductThumbProps {
  handle: string;
  name: string;
  image?: ShopifyImage | null;
  size?: number;
  className?: string;
}

/**
 * Square product thumbnail. Uses a passed image when available, otherwise
 * fetches the featured image from Shopify by handle. Falls back to a glass
 * placeholder while loading or if no image exists.
 */
export default function ProductThumb({
  handle,
  name,
  image,
  size = 56,
  className = "",
}: ProductThumbProps) {
  const [src, setSrc] = useState<string | null>(image?.url ?? null);

  useEffect(() => {
    if (image?.url) {
      setSrc(image.url);
      return;
    }
    let active = true;
    getProductMeta(handle)
      .then((m) => {
        if (active && m?.image?.url) setSrc(m.image.url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [handle, image?.url]);

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg border bg-white/[0.03] ${className}`}
      style={{ width: size, height: size, borderColor: "rgba(255,255,255,0.08)" }}
    >
      {src ? (
        <Image
          src={src}
          alt={image?.altText ?? name}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-mono text-[10px] uppercase tracking-wider text-cyan/40">
            {name.charAt(0)}
          </span>
        </div>
      )}
    </div>
  );
}
