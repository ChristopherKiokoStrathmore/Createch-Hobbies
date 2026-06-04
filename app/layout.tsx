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
      <body>
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}
