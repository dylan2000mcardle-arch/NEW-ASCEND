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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ascnds.co.uk";
const DESCRIPTION =
  "Sharper jawline, deeper sleep, taller presence — engineered into one overnight recovery stack. Mouth tape, blackout mask, nose tape, height insoles and the Face Framer.";
const TITLE = "ASCND — Recovery Stack for Sleep, Jawline & Presence";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — ASCND",
  },
  description: DESCRIPTION,
  keywords: [
    "sleep mask",
    "mouth tape",
    "nose tape",
    "jawline",
    "height insoles",
    "recovery",
    "biohacking",
    "looksmaxxing",
    "REM optimization",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "ASCND",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
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
