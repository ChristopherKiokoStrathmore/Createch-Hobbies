"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppBubble from "./WhatsAppBubble";
import LenisProvider from "@/components/providers/LenisProvider";
import VideoBackground from "./VideoBackground";
import SplashScreen from "./SplashScreen";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      <SplashScreen />
      <VideoBackground />
      <CartProvider>
        <LenisProvider>
          <Navbar />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
          <WhatsAppBubble />
        </LenisProvider>
      </CartProvider>
    </>
  );
}
