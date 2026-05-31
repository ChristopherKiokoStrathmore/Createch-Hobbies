import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppBubble from "@/components/layout/WhatsAppBubble";
import LenisProvider from "@/components/providers/LenisProvider";
import VideoBackground from "@/components/layout/VideoBackground";

export const metadata: Metadata = {
  title: "Createch Hobbies — DIY Kits for Kids",
  description:
    "Build something amazing! DIY assembly kits that spark creativity and STEM learning in every child. Shop 17+ kit types — delivered across Nairobi.",
  keywords: "DIY kits, kids, STEM, toys, Nairobi, Kenya, educational toys, robotics, science kits",
  openGraph: {
    title: "Createch Hobbies — DIY Kits for Kids",
    description: "Build something amazing! DIY assembly kits that spark creativity and STEM learning.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Fixed video layer — behind everything, plays across all pages */}
        <VideoBackground />
        <LenisProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <WhatsAppBubble />
        </LenisProvider>
      </body>
    </html>
  );
}
