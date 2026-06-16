"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getProductMeta } from "@/lib/shopify";

interface ProductVisualProps {
  handle: string;
  name: string;
  className?: string;
}

/**
 * Full-bleed product photo pulled live from Shopify by handle. Used on mobile
 * where the Three.js scenes are gated off — gives cold ad traffic a real
 * product visual instead of an empty gradient panel. Shows the cyan glass
 * gradient as a fallback while the image loads or if none exists.
 */
export default function ProductVisual({
  handle,
  name,
  className = "",
}: ProductVisualProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [alt, setAlt] = useState(name);

  useEffect(() => {
    let active = true;
    getProductMeta(handle)
      .then((m) => {
        if (active && m?.image?.url) {
          setSrc(m.image.url);
          if (m.image.altText) setAlt(m.image.altText);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [handle]);

  return (
    <div
      className={`glass relative overflow-hidden rounded-2xl ${className}`}
      style={{
        background:
          "radial-gradient(80% 60% at 50% 40%, rgba(0,243,255,0.16) 0%, rgba(0,168,179,0.06) 40%, rgba(1,1,1,0) 75%)",
      }}
    >
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 28rem"
          className="object-cover"
        />
      )}
    </div>
  );
}
