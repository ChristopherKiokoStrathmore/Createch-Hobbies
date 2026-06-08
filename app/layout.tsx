import type { Metadata } from "next";
import "./globals.css";
import PublicShell from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "Createch Hobbies | DIY Kits for Kids",
  description:
    "Build something amazing! DIY assembly kits that spark creativity and STEM learning in every child. Shop 17+ kit types, delivered across Nairobi.",
  keywords: "DIY kits, kids, STEM, toys, Nairobi, Kenya, educational toys, robotics, science kits",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Createch Hobbies | DIY Kits for Kids",
    description: "Build something amazing! DIY assembly kits that spark creativity and STEM learning.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Tell the browser to fetch hero videos early, before JS boots */}
        <link rel="preload" as="video" href="/video/hero-landscape.mp4" media="(orientation: landscape)" />
        <link rel="preload" as="video" href="/video/hero-portrait.mp4" media="(orientation: portrait)" />
      </head>
      <body>
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}
