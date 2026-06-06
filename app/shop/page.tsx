"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { categories, type Category, type Difficulty, type Product } from "@/data/products";
import ProductCard from "@/components/products/ProductCard";

const difficulties: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

type AgeGroup = "Under 7" | "Ages 7–9" | "Ages 10–12" | "Ages 12+";
const ageGroups: AgeGroup[] = ["Under 7", "Ages 7–9", "Ages 10–12", "Ages 12+"];

function parseAgeRange(range: string): { min: number; max: number } {
  const parts = range.split("–");
  return { min: parseInt(parts[0]), max: parseInt(parts[1] ?? parts[0]) };
}

function matchesAgeGroup(product: Product, group: AgeGroup): boolean {
  const { min, max } = parseAgeRange(product.ageRange);
  switch (group) {
    case "Under 7":    return min <= 7;
    case "Ages 7–9":   return min <= 9 && max >= 7;
    case "Ages 10–12": return min <= 12 && max >= 10;
    case "Ages 12+":   return max >= 12;
  }
}

function ShopContent() {
  const searchParams = useSearchParams();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | "All">("All");
  const [activeAge, setActiveAge] = useState<AgeGroup | "All">("All");
  const [sort, setSort] = useState<"default" | "price-asc" | "price-desc">("default");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => { setAllProducts(data); setLoadingProducts(false); })
      .catch(() => setLoadingProducts(false));
  }, []);

  /* Sync category filter from URL query param (?category=Science) */
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && (categories as readonly string[]).includes(cat)) {
      setActiveCategory(cat as Category);
    } else {
      setActiveCategory("All");
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = allProducts;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (activeCategory !== "All") list = list.filter((p) => p.category === activeCategory);
    if (activeDifficulty !== "All") list = list.filter((p) => p.difficulty === activeDifficulty);
    if (activeAge !== "All") list = list.filter((p) => matchesAgeGroup(p, activeAge));
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [allProducts, search, activeCategory, activeDifficulty, activeAge, sort]);

  const clearAll = () => {
    setSearch("");
    setActiveCategory("All");
    setActiveDifficulty("All");
    setActiveAge("All");
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 bg-brand-dark">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <span className="text-brand-purple-light font-inter font-semibold text-xs uppercase tracking-[0.2em]">
            Our Collection
          </span>
          <h1 className="font-playfair font-bold text-4xl md:text-5xl text-white mt-4">
            All DIY Kits
          </h1>
          <p className="text-white/40 mt-3 font-inter text-sm">
            {loadingProducts ? "Loading…" : `${filtered.length} kit${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input
              type="text"
              placeholder="Search kits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full section-card border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-brand-dark/40 focus:outline-none focus:border-brand-purple/50 transition-colors text-sm font-inter"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="section-card border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-purple/50 transition-colors cursor-pointer text-sm font-inter"
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>

        {/* Age chips */}
        <div className="mb-3">
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-inter mb-2">Age Group</p>
          <div className="flex flex-wrap gap-2">
            {(["All", ...ageGroups] as const).map((age) => (
              <button
                key={age}
                onClick={() => setActiveAge(age as AgeGroup | "All")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all font-inter ${
                  activeAge === age
                    ? "border-brand-yellow text-brand-dark bg-brand-yellow"
                    : "border-white/15 text-white/50 hover:border-brand-dark/35 hover:text-brand-dark"
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        {/* Category chips */}
        <div className="mb-3">
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-inter mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {(["All", ...categories] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all font-inter ${
                  activeCategory === cat
                    ? "border-brand-yellow text-brand-dark bg-brand-yellow"
                    : "border-white/15 text-white/50 hover:border-brand-dark/35 hover:text-brand-dark"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty chips */}
        <div className="mb-10">
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-inter mb-2">Difficulty</p>
          <div className="flex flex-wrap gap-2">
            {(["All", ...difficulties] as const).map((d) => (
              <button
                key={d}
                onClick={() => setActiveDifficulty(d)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all font-inter ${
                  activeDifficulty === d
                    ? "border-brand-purple text-white bg-brand-purple"
                    : "border-white/10 text-white/35 hover:border-brand-dark/30 hover:text-brand-dark"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/5 aspect-[4/5] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-white/30">
            <Search className="w-14 h-14 text-white/20 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-lg font-playfair font-bold text-white/50">No kits match your filters.</p>
            <button
              onClick={clearAll}
              className="mt-4 text-brand-purple underline text-sm font-inter font-semibold"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ShopContent />
    </Suspense>
  );
}
