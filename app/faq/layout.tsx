import type { Metadata } from "next";

// app/faq/page.tsx is a client component and cannot export metadata.
export const metadata: Metadata = {
  title: "FAQ | Createch Hobbies",
  description:
    "Delivery times and fees, age suitability, payment by M-Pesa, missing parts and returns — answers to the questions we get asked most.",
  openGraph: {
    title: "FAQ | Createch Hobbies",
    description:
      "Delivery, ages, M-Pesa payment, missing parts and returns — answers to the questions we get asked most.",
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
