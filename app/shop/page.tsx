"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ChevronDown, LayoutGrid, LayoutList } from "lucide-react";
import { orderCategories, orderDifficulties, type Product } from "@/data/products";
import ProductCard from "@/components/products/ProductCard";
import { useSiteConfig } from "@/context/SiteConfigContext";
import type { AgeBracket } from "@/types/site-config";

// Accepts "8–12" (en dash), "8-12" (hyphen) and a bare "8". A range we cannot
// read is treated as spanning every age, so a typo in WooCommerce makes a kit
// over-visible rather than invisible — a customer seeing one extra kit is a much
// cheaper mistake than a kit nobody can find.
function parseAgeRange(range: string): { min: number; max: number } {
  const parts = String(range).split(/[–—-]/);
  const min = parseInt(parts[0], 10);
  const max = parseInt(parts[1] ?? parts[0], 10);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 99 };
  return min <= max ? { min, max } : { min: max, max: min };
}

// A kit belongs in a bracket when the two ranges overlap — the ordinary meaning
// of "suitable for this age". The previous rules were looser and asymmetric, so
// a 6–12 kit satisfied all four brackets at once and the filter never narrowed
// anything.
function matchesAgeBracket(product: Product, bracket: AgeBracket): boolean {
  const { min, max } = parseAgeRange(product.ageRange);
  return min <= bracket.max && max >= bracket.min;
}

function ShopContent() {
  const searchParams = useSearchParams();
  const { shop } = useSiteConfig();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeDifficulty, setActiveDifficulty] = useState<string>("All");
  // Held as a bracket id rather than a label so renaming a bracket in the editor
  // does not silently deselect the customer's current filter.
  const [activeAge, setActiveAge] = useState<string>("All");
  const [sort, setSort] = useState<"default" | "price-asc" | "price-desc">("default");
  const [ageOpen, setAgeOpen]           = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [difficultyOpen, setDifficultyOpen] = useState(false);
  const [compact, setCompact]           = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => { setAllProducts(data); setLoadingProducts(false); })
      .catch(() => setLoadingProducts(false));
  }, []);

  /* Filter options come from the live catalog, so a category or difficulty
     created in WooCommerce shows up here without a code change. */
  const categories   = useMemo(() => orderCategories(allProducts.map((p) => p.category)), [allProducts]);
  const difficulties = useMemo(() => orderDifficulties(allProducts.map((p) => p.difficulty)), [allProducts]);

  /* Sync category filter from URL query param (?category=Science) */
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && categories.includes(cat)) {
      setActiveCategory(cat);
    } else {
      setActiveCategory("All");
    }
  }, [searchParams, categories]);

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
    if (activeAge !== "All") {
      const bracket = shop.ageBrackets.find((b) => b.id === activeAge);
      if (bracket) list = list.filter((p) => matchesAgeBracket(p, bracket));
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [allProducts, search, activeCategory, activeDifficulty, activeAge, sort, shop.ageBrackets]);

  const activeAgeLabel =
    shop.ageBrackets.find((b) => b.id === activeAge)?.label ?? "";
  const countText = (filtered.length === 1 ? shop.countOne : shop.countMany)
    .replace("{n}", String(filtered.length));

  const clearAll = () => {
    setSearch("");
    setActiveCategory("All");
    setActiveDifficulty("All");
    setActiveAge("All");
  };

  return (
    <div className="min-h-screen pt-16 [@media(orientation:portrait)]:pt-24 sm:pt-24 pb-20 px-3 sm:px-6 bg-brand-dark">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3 sm:mb-10">
          <span
            data-editor-key="shop.eyebrow"
            className="text-brand-purple-light font-inter font-semibold text-xs uppercase tracking-[0.2em]"
          >
            {shop.eyebrow}
          </span>
          <h1
            data-editor-key="shop.title"
            className="font-playfair font-bold text-2xl sm:text-4xl md:text-5xl text-white mt-1 sm:mt-4"
          >
            {shop.title}
          </h1>
          <div className="flex items-center justify-between mt-1 sm:mt-3">
            <p data-editor-key="shop.count" className="text-white/40 font-inter text-xs sm:text-sm">
              {loadingProducts ? "Loading…" : countText}
            </p>
            {/* View toggle — portrait only */}
            <div className="flex sm:hidden items-center gap-1 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.07)" }}>
              <button
                onClick={() => setCompact(true)}
                aria-label="Grid view"
                className={`p-1.5 rounded-md transition-all ${compact ? "bg-brand-yellow text-brand-dark" : "text-white/40 hover:text-white"}`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setCompact(false)}
                aria-label="List view"
                className={`p-1.5 rounded-md transition-all ${!compact ? "bg-brand-yellow text-brand-dark" : "text-white/40 hover:text-white"}`}
              >
                <LayoutList size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Search + Sort — side by side on mobile */}
        <div className="flex flex-row gap-2 mb-2 sm:mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
            <input
              type="text"
              placeholder={shop.searchPlaceholder}
              data-editor-key="shop.searchPlaceholder"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full section-card border border-white/8 rounded-xl pl-8 pr-3 py-2 sm:py-3 text-white placeholder:text-brand-dark/40 focus:outline-none focus:border-brand-purple/50 transition-colors text-xs sm:text-sm font-inter"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="section-card border border-white/8 rounded-xl px-2 sm:px-4 py-2 sm:py-3 text-white focus:outline-none focus:border-brand-purple/50 transition-colors cursor-pointer text-xs sm:text-sm font-inter"
          >
            <option value="default">Default</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
          </select>
        </div>

        {/* Collapsible filters */}
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 mb-2 sm:mb-8">

          {/* Age Group */}
          <div className="flex-1 rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => setAgeOpen(!ageOpen)}
              className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-white/5 transition-colors"
            >
              <span
                data-editor-key="shop.ageBrackets"
                className="flex items-center gap-2 text-xs font-semibold font-inter text-white/60 uppercase tracking-widest"
              >
                {shop.ageFilterLabel}
                {activeAge !== "All" && (
                  <span className="px-2 py-0.5 rounded-full bg-brand-yellow text-brand-dark text-[10px] font-bold normal-case tracking-normal">
                    {activeAgeLabel}
                  </span>
                )}
              </span>
              <ChevronDown size={14} className={`text-white/30 transition-transform duration-200 ${ageOpen ? "rotate-180" : ""}`} />
            </button>
            {ageOpen && (
              <div className="flex flex-wrap gap-2 px-4 pb-4 pt-1">
                {[{ id: "All", label: shop.allLabel }, ...shop.ageBrackets].map((age) => (
                  <button
                    key={age.id}
                    onClick={() => setActiveAge(age.id)}
                    className={`px-4 py-3 rounded-full text-xs font-semibold border transition-all font-inter ${
                      activeAge === age.id
                        ? "border-brand-yellow text-brand-dark bg-brand-yellow"
                        : "border-white/15 text-white/50 hover:border-white/35 hover:text-white"
                    }`}
                  >
                    {age.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category */}
          <div className="flex-1 rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-white/5 transition-colors"
            >
              <span
                data-editor-key="shop.categoryFilterLabel"
                className="flex items-center gap-2 text-xs font-semibold font-inter text-white/60 uppercase tracking-widest"
              >
                {shop.categoryFilterLabel}
                {activeCategory !== "All" && (
                  <span className="px-2 py-0.5 rounded-full bg-brand-yellow text-brand-dark text-[10px] font-bold normal-case tracking-normal">
                    {activeCategory}
                  </span>
                )}
              </span>
              <ChevronDown size={14} className={`text-white/30 transition-transform duration-200 ${categoryOpen ? "rotate-180" : ""}`} />
            </button>
            {categoryOpen && (
              <div className="flex flex-wrap gap-2 px-4 pb-4 pt-1">
                {["All", ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-3 rounded-full text-xs font-semibold border transition-all font-inter ${
                      activeCategory === cat
                        ? "border-brand-yellow text-brand-dark bg-brand-yellow"
                        : "border-white/15 text-white/50 hover:border-white/35 hover:text-white"
                    }`}
                  >
                    {cat === "All" ? shop.allLabel : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Difficulty */}
          <div className="flex-1 rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => setDifficultyOpen(!difficultyOpen)}
              className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-white/5 transition-colors"
            >
              <span
                data-editor-key="shop.difficultyFilterLabel"
                className="flex items-center gap-2 text-xs font-semibold font-inter text-white/60 uppercase tracking-widest"
              >
                {shop.difficultyFilterLabel}
                {activeDifficulty !== "All" && (
                  <span className="px-2 py-0.5 rounded-full bg-brand-purple text-white text-[10px] font-bold normal-case tracking-normal">
                    {activeDifficulty}
                  </span>
                )}
              </span>
              <ChevronDown size={14} className={`text-white/30 transition-transform duration-200 ${difficultyOpen ? "rotate-180" : ""}`} />
            </button>
            {difficultyOpen && (
              <div className="flex flex-wrap gap-2 px-4 pb-4 pt-1">
                {["All", ...difficulties].map((d) => (
                  <button
                    key={d}
                    onClick={() => setActiveDifficulty(d)}
                    className={`px-4 py-3 rounded-full text-xs font-semibold border transition-all font-inter ${
                      activeDifficulty === d
                        ? "border-brand-purple text-white bg-brand-purple"
                        : "border-white/10 text-white/35 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {d === "All" ? shop.allLabel : d}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Grid */}
        {loadingProducts ? (
          <div className={`grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5 ${compact ? "grid-cols-2 gap-1" : "grid-cols-1 gap-3"}`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`rounded-xl sm:rounded-2xl bg-white/5 animate-pulse ${compact ? "aspect-square sm:aspect-[4/5]" : "aspect-[4/3] sm:aspect-[4/5]"}`} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-white/30">
            <Search className="w-14 h-14 text-white/20 mx-auto mb-4" strokeWidth={1.5} />
            <p data-editor-key="shop.emptyMessage" className="text-lg font-playfair font-bold text-white/50">
              {shop.emptyMessage}
            </p>
            <button
              onClick={clearAll}
              data-editor-key="shop.clearLabel"
              className="mt-4 text-brand-purple underline text-sm font-inter font-semibold"
            >
              {shop.clearLabel}
            </button>
          </div>
        ) : (
          <div className={`grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5 ${compact ? "grid-cols-2 gap-1" : "grid-cols-1 gap-3"}`}>
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} compact={compact} />
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
