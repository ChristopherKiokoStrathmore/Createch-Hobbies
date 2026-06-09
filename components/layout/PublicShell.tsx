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
import AnnouncementBanner from "@/components/editor/AnnouncementBanner";
import EditorOverlay     from "@/components/editor/EditorOverlay";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return (
      <>
        <VideoBackground />
        {children}
      </>
    );
  }

  return (
    <>
      <SplashScreen />
      <VideoBackground />
      <EditorOverlay />
      <CartProvider>
        <LenisProvider>
          <AnnouncementBanner />
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
