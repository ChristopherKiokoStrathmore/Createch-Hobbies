import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getProduct, getProducts, wooConfigured } from "@/lib/woo";
import { productCategories, type Product } from "@/data/products";
import { categoryEmoji } from "@/lib/category-visuals";
import { formatPrice } from "@/lib/utils";
import ProductCard from "@/components/products/ProductCard";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import OrderButton from "@/components/products/OrderButton";

// Short TTL + the "woo-products" fetch tag (purged by /api/revalidate when a
// WooCommerce webhook fires) keep this page in step with backend edits.
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

const difficultyStyles: Record<string, string> = {
  Beginner:     "bg-green-100 text-green-800 border-green-300",
  Intermediate: "bg-amber-100 text-amber-800 border-amber-300",
  Advanced:     "bg-brand-purple/15 text-brand-purple border-brand-purple/30",
};
const defaultDifficultyStyle = "bg-gray-100 text-gray-800 border-gray-300";

export async function generateStaticParams() {
  if (!wooConfigured) return [];
  try {
    const products = await getProducts();
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  if (!wooConfigured) notFound();

  const product: Product | null = await getProduct(slug).catch(() => null);
  if (!product) notFound();

  let related: Product[] = [];
  try {
    const all = await getProducts();
    // A kit is filed under several Woo categories, so "related" is any kit that
    // shares one of them — not just an exact match on the primary category.
    const mine = productCategories(product);
    related = all
      .filter((p) => p.id !== product.id && productCategories(p).some((c) => mine.includes(c)))
      .slice(0, 3);
  } catch {
    related = [];
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 bg-brand-dark">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-white/30 text-sm mb-6 font-inter">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="text-white/15">/</span>
          <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
          <span className="text-white/15">/</span>
          <span className="text-white/60">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          <ProductImageGallery
            images={product.images}
            productName={product.name}
            fallbackEmoji={categoryEmoji(product.category)}
          />

          {/* Info panel */}
          <div>
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.category && (
                <span className="bg-brand-purple/15 text-brand-purple-light border border-brand-purple/25 text-xs font-semibold px-3 py-1 rounded-full font-inter">
                  {product.category}
                </span>
              )}
              <span className="bg-brand-dark/8 text-brand-dark/60 border border-brand-dark/15 text-xs font-semibold px-3 py-1 rounded-full font-inter">
                Ages {product.ageRange}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border font-inter ${difficultyStyles[product.difficulty] ?? defaultDifficultyStyle}`}>
                {product.difficulty}
              </span>
              {!product.inStock && (
                <span className="bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-semibold px-3 py-1 rounded-full font-inter">
                  Out of Stock
                </span>
              )}
            </div>

            <h1 className="font-playfair font-bold text-3xl md:text-4xl text-white mb-3 leading-tight">
              {product.name}
            </h1>

            <p className="text-white/50 leading-relaxed text-sm mb-5 font-inter">
              {product.description}
            </p>

            {/* What you'll learn */}
            {product.whatYouLearn.length > 0 && (
              <div className="mb-5">
                <h3 className="font-inter font-semibold text-white/40 text-xs uppercase tracking-widest mb-3">
                  What Your Child Will Learn
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.whatYouLearn.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1.5 bg-white/70 border border-brand-dark/15 text-brand-dark text-xs font-medium px-3 py-1.5 rounded-full font-inter"
                    >
                      <CheckCircle2 size={11} />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Box contents */}
            <div className="section-card rounded-2xl p-4 border border-white/5 mb-5">
              <h3 className="font-inter font-semibold text-white/40 text-xs uppercase tracking-widest mb-3">
                What&apos;s in the Box
              </h3>
              <ul className="text-white/50 text-sm space-y-1.5 font-inter">
                {[
                  "All kit parts (pre-cut, snap-fit, no glue)",
                  "Step-by-step illustrated instructions",
                  "Science guide explaining how it works",
                  "Quality checked before shipping",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 size={14} className="text-brand-purple shrink-0" strokeWidth={1.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Price + CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <div className="text-white/35 text-xs font-inter uppercase tracking-widest mb-0.5">Price</div>
                <div className="font-playfair font-bold text-3xl text-white">
                  {formatPrice(product.price)}
                  {product.onSale && (
                    <span className="ml-3 text-white/30 line-through text-lg font-inter font-medium align-middle">
                      {formatPrice(product.regularPrice)}
                    </span>
                  )}
                </div>
                {product.onSale && (
                  <div className="text-brand-yellow text-xs font-inter font-semibold mt-1">
                    On sale — save {formatPrice(product.regularPrice - product.price)}
                  </div>
                )}
              </div>
              <div className="text-white/30 text-xs text-right font-inter leading-relaxed">
                Delivery across Nairobi<br />usually 1–2 days
              </div>
            </div>

            <OrderButton product={product} />
            <p className="text-white/25 text-xs text-center mt-2.5 font-inter">
              Review your cart, then send to us on WhatsApp
            </p>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
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
