import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppBubble from "@/components/layout/WhatsAppBubble";
import LenisProvider from "@/components/providers/LenisProvider";
import VideoBackground from "@/components/layout/VideoBackground";
import SplashScreen from "@/components/layout/SplashScreen";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";

export const metadata: Metadata = {
  title: "Createch Hobbies | DIY Kits for Kids",
  description:
    "Build something amazing! DIY assembly kits that spark creativity and STEM learning in every child. Shop 17+ kit types, delivered across Nairobi.",
  keywords: "DIY kits, kids, STEM, toys, Nairobi, Kenya, educational toys, robotics, science kits",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Createch Hobbies | DIY Kits for Kids",
    description: "Build something amazing! DIY assembly kits that spark creativity and STEM learning.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Branded splash screen — fades out after 1.9 s */}
        <SplashScreen />
        {/* Fixed video layer — behind everything, plays across all pages */}
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
      </body>
    </html>
  );
}
