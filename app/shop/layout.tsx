import type { Metadata } from "next";

// app/shop/page.tsx is a client component and so cannot export metadata itself.
// This layout supplies it for /shop; /shop/[slug] overrides it per product.
export const metadata: Metadata = {
  title: "Shop All Kits | Createch Hobbies",
  description:
    "Browse every Createch DIY assembly kit — vehicles, robots, machines and science builds for ages 5–14. Filter by age, category or difficulty. Delivered across Nairobi.",
  openGraph: {
    title: "Shop All Kits | Createch Hobbies",
    description:
      "Browse every Createch DIY assembly kit — vehicles, robots, machines and science builds for ages 5–14.",
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
