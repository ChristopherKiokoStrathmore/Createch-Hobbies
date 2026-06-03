"use client";

import Link from "next/link";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { whatsappGeneralLink } from "@/lib/whatsapp";

const ageGroups = [
  {
    label: "Ages 5–7",
    emoji: "🌱",
    description: "Simple, satisfying builds a young child can mostly do on their own.",
    slugs: ["marble-run", "house", "train", "windmill"],
  },
  {
    label: "Ages 7–10",
    emoji: "⚡",
    description: "More parts, more excitement. The sweet spot for curious builders.",
    slugs: ["glider-plane", "optical-illusion-fan", "table-fan", "ferris-wheel", "cable-car"],
  },
  {
    label: "Ages 10–14",
    emoji: "🚀",
    description: "Real engineering challenges that feel like a proper achievement.",
    slugs: ["walking-robot", "hydraulic-digger", "solar-fan", "tank", "lunar-rover"],
  },
];

const budgetGroups = [
  {
    label: "Under KES 1,000",
    emoji: "💚",
    maxPrice: 999,
  },
  {
    label: "KES 1,000 – 1,500",
    emoji: "💛",
    minPrice: 1000,
    maxPrice: 1500,
  },
  {
    label: "KES 1,500+",
    emoji: "💜",
    minPrice: 1501,
  },
];

const interestGroups = [
  { label: "Vehicles",     emoji: "🚗", category: "Vehicles" },
  { label: "Machines",     emoji: "⚙️", category: "Machines" },
  { label: "Science",      emoji: "🔬", category: "Science" },
  { label: "Space",        emoji: "🚀", category: "Space" },
  { label: "Robots",       emoji: "🤖", category: "Robots" },
  { label: "Architecture", emoji: "🏗️", category: "Architecture" },
];

/* Card style shared across all three sections */
const cardStyle = {
  background: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(10,10,15,0.08)",
};

function ProductPill({ slug }: { slug: string }) {
  const product = products.find((p) => p.slug === slug);
  if (!product) return null;
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="flex items-center justify-between gap-4 rounded-xl px-4 py-3 transition-all group"
      style={{
        background: "rgba(245,190,77,0.18)",
        border: "1px solid rgba(10,10,15,0.07)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(245,190,77,0.38)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(245,190,77,0.18)"; }}
    >
      <span className="font-inter text-sm text-brand-dark/80 font-medium">
        {product.name}
      </span>
      <span className="text-brand-purple font-semibold text-sm font-inter shrink-0">
        {formatPrice(product.price)}
      </span>
    </Link>
  );
}

export default function GiftGuidePage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 bg-brand-dark">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-brand-purple-light font-inter font-semibold text-xs uppercase tracking-[0.2em]">
            Gift Guide
          </span>
          <h1 className="font-playfair font-bold text-5xl md:text-6xl text-white mt-5 mb-5 leading-tight">
            The Perfect Kit for{" "}
            <em className="text-gradient not-italic">Every Child</em>
          </h1>
          <p className="text-white/50 text-lg font-inter max-w-xl mx-auto">
            Not sure which kit to choose? Browse by age, interest, or budget. We&apos;ll help you pick the one they&apos;ll remember.
          </p>
        </div>

        {/* Shop by Age */}
        <div className="mb-16">
          <h2 className="font-playfair font-bold text-2xl text-white mb-8 flex items-center gap-3">
            <span className="w-1 h-6 bg-brand-yellow rounded-full inline-block" />
            Shop by Age
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ageGroups.map((group) => (
              <div
                key={group.label}
                className="rounded-2xl p-6 transition-colors"
                style={cardStyle}
              >
                <div className="text-4xl mb-3">{group.emoji}</div>
                <h3 className="font-playfair font-bold text-brand-dark text-lg mb-1">{group.label}</h3>
                <p className="text-brand-dark/45 text-xs font-inter mb-5 leading-relaxed">
                  {group.description}
                </p>
                <div className="space-y-2">
                  {group.slugs.map((slug) => (
                    <ProductPill key={slug} slug={slug} />
                  ))}
                </div>
                <Link
                  href={`/shop?age=${encodeURIComponent(group.label)}`}
                  className="mt-4 block text-center text-brand-purple/70 hover:text-brand-purple text-xs font-inter transition-colors font-semibold"
                >
                  See all {group.label} kits →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Shop by Interest */}
        <div className="mb-16">
          <h2 className="font-playfair font-bold text-2xl text-white mb-8 flex items-center gap-3">
            <span className="w-1 h-6 bg-brand-purple rounded-full inline-block" />
            Shop by Interest
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {interestGroups.map((group) => {
              const kits = products.filter((p) => p.category === group.category);
              if (kits.length === 0) return null;
              return (
                <div
                  key={group.label}
                  className="rounded-2xl p-6 transition-colors"
                  style={cardStyle}
                >
                  <div className="text-4xl mb-3">{group.emoji}</div>
                  <h3 className="font-playfair font-bold text-brand-dark text-lg mb-4">{group.label}</h3>
                  <div className="space-y-2">
                    {kits.slice(0, 4).map((p) => (
                      <ProductPill key={p.slug} slug={p.slug} />
                    ))}
                    {kits.length > 4 && (
                      <p className="text-brand-dark/35 text-xs font-inter pt-1 text-center">
                        +{kits.length - 4} more
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/shop?category=${encodeURIComponent(group.category)}`}
                    className="mt-4 block text-center text-brand-purple/70 hover:text-brand-purple text-xs font-inter transition-colors font-semibold"
                  >
                    See all {group.label} kits →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shop by Budget */}
        <div className="mb-16">
          <h2 className="font-playfair font-bold text-2xl text-white mb-8 flex items-center gap-3">
            <span className="w-1 h-6 bg-[#25D366] rounded-full inline-block" />
            Shop by Budget
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {budgetGroups.map((group) => {
              const kits = products.filter((p) => {
                if (group.minPrice && p.price < group.minPrice) return false;
                if (group.maxPrice && p.price > group.maxPrice) return false;
                return true;
              });
              return (
                <div
                  key={group.label}
                  className="rounded-2xl p-6"
                  style={cardStyle}
                >
                  <div className="text-3xl mb-3">{group.emoji}</div>
                  <h3 className="font-playfair font-bold text-brand-dark text-lg mb-4">{group.label}</h3>
                  <div className="space-y-2">
                    {kits.slice(0, 4).map((p) => (
                      <ProductPill key={p.slug} slug={p.slug} />
                    ))}
                    {kits.length > 4 && (
                      <p className="text-brand-dark/35 text-xs font-inter pt-1 text-center">
                        +{kits.length - 4} more in this range
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gift tip */}
        <div
          className="rounded-2xl p-8 mb-10"
          style={{
            background: "linear-gradient(135deg, rgba(245,190,77,0.06) 0%, rgba(117,67,152,0.06) 100%)",
            border: "1px solid rgba(245,190,77,0.15)",
          }}
        >
          <div className="text-4xl mb-4">🎁</div>
          <h3 className="font-playfair font-bold text-white text-xl mb-2">
            Not sure? Just ask us.
          </h3>
          <p className="text-white/50 text-sm font-inter mb-5 max-w-lg">
            Tell us your child&apos;s age, interests, and budget. We&apos;ll recommend the perfect kit and have it delivered before the big day.
          </p>
          <a
            href={whatsappGeneralLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-6 py-3 rounded-full text-sm transition-all font-inter"
          >
            Get a personalised recommendation →
          </a>
        </div>

        <div className="text-center">
          <Link href="/shop" className="text-brand-yellow text-sm font-inter hover:underline">
            Browse all 17 kits →
          </Link>
        </div>
      </div>
    </div>
  );
}
