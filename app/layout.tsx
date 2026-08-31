import type { Metadata } from "next";
import "./globals.css";
import PublicShell from "@/components/layout/PublicShell";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import { getSiteConfig, hexToRgbSpace } from "@/lib/getSiteConfig";

export async function generateMetadata(): Promise<Metadata> {
  const cfg = await getSiteConfig();
  return {
    // Required for og:image to resolve to an absolute URL — WhatsApp and
    // Facebook reject relative image paths outright.
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://createch-hobbies.co.ke",
    ),
    title:       cfg.seo.title,
    description: cfg.seo.description,
    keywords:    "DIY kits, kids, STEM, toys, Nairobi, Kenya, educational toys, robotics, science kits",
    // No `icons` key on purpose: app/favicon.ico, app/icon.png and
    // app/apple-icon.png are picked up by Next's file conventions, and an
    // explicit `icons` here would override them. The wordmark logo.png is
    // 2083px/239KB — far too heavy to serve as a 16px favicon.
    openGraph: {
      title:       cfg.seo.ogTitle || cfg.seo.title,
      description: cfg.seo.ogDescription || cfg.seo.description,
      type:        "website",
      ...(cfg.seo.ogImage ? { images: [cfg.seo.ogImage] } : {}),
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cfg = await getSiteConfig();

  const cssVars = {
    "--c-yellow": hexToRgbSpace(cfg.tokens.yellow),
    "--c-purple": hexToRgbSpace(cfg.tokens.purple),
    "--c-dark":   hexToRgbSpace(cfg.tokens.dark),
    "--font-heading": `'${cfg.typography.headingFont}', Georgia, serif`,
    "--font-body":    `'${cfg.typography.bodyFont}', sans-serif`,
  } as React.CSSProperties;

  return (
    <html lang="en" style={cssVars} data-scroll-behavior="smooth">
      <head />
      <body>
        <SiteConfigProvider serverConfig={cfg}>
          <PublicShell>{children}</PublicShell>
        </SiteConfigProvider>
      </body>
    </html>
  );
}
