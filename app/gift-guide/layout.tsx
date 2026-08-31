import type { Metadata } from "next";

// app/gift-guide/page.tsx is a client component and cannot export metadata.
export const metadata: Metadata = {
  title: "Gift Guide | Createch Hobbies",
  description:
    "Not sure which kit to choose? Find the right DIY build by age, interest or budget — thoughtful STEM gifts for children aged 5–14 in Nairobi.",
  openGraph: {
    title: "Gift Guide | Createch Hobbies",
    description:
      "Find the right DIY kit by age, interest or budget — thoughtful STEM gifts for children aged 5–14.",
  },
};

export default function GiftGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
