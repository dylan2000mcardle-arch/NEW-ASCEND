"use client";

import type { ReactNode } from "react";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import DeviceProvider from "@/components/providers/DeviceProvider";
import CartProvider from "@/components/providers/CartProvider";
import Navigation from "@/components/layout/Navigation";
import CartDrawer from "@/components/layout/CartDrawer";
import ScrollProgress from "@/components/layout/ScrollProgress";
import Footer from "@/components/layout/Footer";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <DeviceProvider>
      <SmoothScrollProvider>
        <CartProvider>
          <ScrollProgress />
          <Navigation />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </SmoothScrollProvider>
    </DeviceProvider>
  );
}
