import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct, getProducts, wooConfigured } from "@/lib/woo";
import { getSiteConfig } from "@/lib/getSiteConfig";
import type { Product } from "@/data/products";
import ProductCard from "@/components/products/ProductCard";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductInfo from "@/components/products/ProductInfo";

// Short TTL + the "woo-products" fetch tag (purged by /api/revalidate when a
// WooCommerce webhook fires) keep this page in step with backend edits.
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

const categoryEmoji: Record<string, string> = {
  Vehicles:     "🚗",
  Machines:     "⚙️",
  Science:      "🔬",
  Space:        "🚀",
  Robots:       "🤖",
  Architecture: "🏗️",
};
const defaultCategoryEmoji = "🧩";

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

  const config = await getSiteConfig();

  let related: Product[] = [];
  try {
    const all = await getProducts();
    related = all.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);
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
            fallbackEmoji={categoryEmoji[product.category] ?? defaultCategoryEmoji}
          />

          <ProductInfo product={product} />
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2
              data-editor-key="productPage.relatedTitle"
              className="font-playfair font-bold text-3xl text-white mb-8"
            >
              {config.productPage.relatedTitle}
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
