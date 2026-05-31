import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import ProductCard from "@/components/products/ProductCard";
import ProductImage from "@/components/products/ProductImage";
import OrderButton from "@/components/products/OrderButton";

interface Props {
  params: Promise<{ slug: string }>;
}

const difficultyStyles = {
  Beginner: "bg-green-500/15 text-green-400 border-green-500/25",
  Intermediate: "bg-brand-yellow/15 text-brand-yellow border-brand-yellow/25",
  Advanced: "bg-brand-purple/20 text-brand-purple-light border-brand-purple/30",
};

const categoryEmoji: Record<string, string> = {
  Vehicles: "🚗",
  Machines: "⚙️",
  Science: "🔬",
  Space: "🚀",
  Robots: "🤖",
  Architecture: "🏗️",
};

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) notFound();

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6" style={{ backgroundColor: "rgba(10,10,15,0.85)", backdropFilter: "blur(3px)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-white/30 text-sm mb-10 font-inter">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="text-white/15">/</span>
          <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
          <span className="text-white/15">/</span>
          <span className="text-white/60">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
          {/* Image panel */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-[#120e1e] rounded-2xl overflow-hidden border border-white/6">
              <ProductImage
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                fallbackEmoji={categoryEmoji[product.category]}
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 relative bg-[#120e1e] rounded-xl overflow-hidden border border-white/6"
                  >
                    <ProductImage
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      className="object-cover"
                      fallbackEmoji={categoryEmoji[product.category]}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info panel */}
          <div>
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="bg-brand-purple/15 text-brand-purple-light border border-brand-purple/25 text-xs font-semibold px-3 py-1 rounded-full font-inter">
                {product.category}
              </span>
              <span className="bg-white/5 text-white/50 border border-white/10 text-xs font-semibold px-3 py-1 rounded-full font-inter">
                Ages {product.ageRange}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border font-inter ${difficultyStyles[product.difficulty]}`}>
                {product.difficulty}
              </span>
            </div>

            <h1 className="font-playfair font-bold text-4xl md:text-5xl text-white mb-6 leading-tight">
              {product.name}
            </h1>

            <p className="text-white/50 leading-relaxed text-base mb-8 font-inter">
              {product.description}
            </p>

            {/* What you'll learn */}
            <div className="mb-8">
              <h3 className="font-inter font-semibold text-white/40 text-xs uppercase tracking-widest mb-4">
                What Your Child Will Learn
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.whatYouLearn.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-sm font-medium px-3 py-1.5 rounded-full font-inter"
                  >
                    <CheckCircle2 size={12} />
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Box contents */}
            <div className="section-card rounded-2xl p-5 border border-white/5 mb-8">
              <h3 className="font-inter font-semibold text-white/40 text-xs uppercase tracking-widest mb-4">
                What&apos;s in the Box
              </h3>
              <ul className="text-white/50 text-sm space-y-2 font-inter">
                {[
                  "All kit parts (pre-cut, snap-fit — no glue)",
                  "Step-by-step illustrated instructions",
                  "Science guide explaining how it works",
                  "Quality checked before shipping",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="text-brand-yellow">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Price + CTA */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-white/35 text-xs font-inter uppercase tracking-widest mb-1">Price</div>
                <div className="font-playfair font-bold text-4xl text-white">
                  {formatPrice(product.price)}
                </div>
              </div>
              <div className="text-white/30 text-xs text-right font-inter leading-relaxed">
                Delivery across Nairobi<br />usually 1–2 days
              </div>
            </div>

            <OrderButton product={product} />
            <p className="text-white/25 text-xs text-center mt-3 font-inter">
              Review your cart, then send to us on WhatsApp
            </p>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="font-playfair font-bold text-3xl text-white mb-8">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
