"use client";

import { useRouter } from "next/navigation";
import type { WPTerm } from "@/types/blog";

interface Props {
  categories: WPTerm[];
  activeSlug?: string;
}

export default function CategoryTabs({ categories, activeSlug }: Props) {
  const router = useRouter();

  function select(slug?: string) {
    const params = slug ? `?category=${encodeURIComponent(slug)}` : "";
    router.push(`/blog${params}`);
  }

  if (categories.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap justify-center mb-10">
      <button
        onClick={() => select()}
        className={`px-4 py-1.5 rounded-full font-inter text-sm transition-all ${
          !activeSlug
            ? "bg-brand-yellow text-brand-dark font-semibold"
            : "text-white/50 hover:text-white border border-white/15 hover:border-white/30"
        }`}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => select(cat.slug)}
          className={`px-4 py-1.5 rounded-full font-inter text-sm transition-all ${
            activeSlug === cat.slug
              ? "bg-brand-yellow text-brand-dark font-semibold"
              : "text-white/50 hover:text-white border border-white/15 hover:border-white/30"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
