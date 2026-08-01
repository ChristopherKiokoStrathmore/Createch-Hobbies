"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppBubble from "./WhatsAppBubble";
import LenisProvider from "@/components/providers/LenisProvider";
import VideoBackground from "./VideoBackground";
import SplashScreen from "./SplashScreen";
import { CartProvider } from "@/context/CartContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import CartDrawer from "@/components/cart/CartDrawer";
import AnnouncementBanner from "@/components/editor/AnnouncementBanner";
import EditorOverlay     from "@/components/editor/EditorOverlay";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    // No VideoBackground on /admin: the admin shell paints its own opaque
    // background over it, so the hero video was invisible here yet still
    // played and unmuted on first click. Drop it entirely.
    return <>{children}</>;
  }

  return (
    <>
      <SplashScreen />
      <VideoBackground />
      <EditorOverlay />
      <CustomerAuthProvider>
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
      </CustomerAuthProvider>
    </>
  );
}
