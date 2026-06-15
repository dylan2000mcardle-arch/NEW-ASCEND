import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ASCND — Clinical Recovery & Structural Optimization",
  description:
    "Clinical-grade recovery systems engineered for structural optimization. REM enhancement. Maxillofacial bio-hacking. The ASCND Optimized Recovery Suite.",
  keywords: [
    "sleep mask",
    "mouth tape",
    "jawline",
    "recovery",
    "biohacking",
    "looksmaxxing",
    "REM optimization",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceMono.variable} bg-background text-foreground antialiased`}
      >
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  );
}
