"use client";

import { CheckCircle2 } from "lucide-react";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { useSiteConfig } from "@/context/SiteConfigContext";
import OrderButton from "./OrderButton";

// The product page itself is a server component (it fetches from WooCommerce),
// but the copy around the product has to be a client component: the editor drives
// its live preview by posting config into the page, and only client components
// re-render on that. Product *data* still arrives as a prop from the server.

const difficultyStyles: Record<string, string> = {
  Beginner:     "bg-green-100 text-green-800 border-green-300",
  Intermediate: "bg-amber-100 text-amber-800 border-amber-300",
  Advanced:     "bg-brand-purple/15 text-brand-purple border-brand-purple/30",
};
const defaultDifficultyStyle = "bg-gray-100 text-gray-800 border-gray-300";

export default function ProductInfo({ product }: { product: Product }) {
  const { productPage: copy, productCard: label } = useSiteConfig();

  // Per-product contents win; otherwise the editable default. Falling back
  // rather than hiding keeps every kit page complete while the catalogue is
  // filled in one product at a time.
  const boxItems =
    product.whatsInTheBox.length > 0 ? product.whatsInTheBox : copy.whatsInTheBoxItems;

  return (
    // data-product-id lets the editor's inspect overlay work out which kit a
    // clicked field belongs to, so it can deep-link into WooCommerce.
    <div data-product-id={product.id}>
      {/* Tags — all four are product data, owned by WooCommerce */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span
          data-editor-key="product.category"
          className="bg-brand-purple/15 text-brand-purple-light border border-brand-purple/25 text-xs font-semibold px-3 py-1 rounded-full font-inter"
        >
          {product.category}
        </span>
        <span
          data-editor-key="product.ageRange"
          className="bg-brand-dark/8 text-brand-dark/60 border border-brand-dark/15 text-xs font-semibold px-3 py-1 rounded-full font-inter"
        >
          Ages {product.ageRange}
        </span>
        <span
          data-editor-key="product.difficulty"
          className={`text-xs font-semibold px-3 py-1 rounded-full border font-inter ${
            difficultyStyles[product.difficulty] ?? defaultDifficultyStyle
          }`}
        >
          {product.difficulty}
        </span>
        {!product.inStock && (
          <span
            data-editor-key="product.stock"
            className="bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-semibold px-3 py-1 rounded-full font-inter"
          >
            {label.outOfStockBadge}
          </span>
        )}
      </div>

      <h1
        data-editor-key="product.name"
        className="font-playfair font-bold text-3xl md:text-4xl text-white mb-3 leading-tight"
      >
        {product.name}
      </h1>

      <p
        data-editor-key="product.description"
        className="text-white/50 leading-relaxed text-sm mb-5 font-inter"
      >
        {product.description}
      </p>

      {/* What they'll learn — hidden entirely when the product has no values,
          because an empty heading reads as a broken page rather than an absence. */}
      {product.whatYouLearn.length > 0 && (
        <div className="mb-5">
          <h3
            data-editor-key="productPage.learnTitle"
            className="font-inter font-semibold text-white/40 text-xs uppercase tracking-widest mb-3"
          >
            {copy.learnTitle}
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.whatYouLearn.map((skill) => (
              <span
                key={skill}
                data-editor-key="product.whatYouLearn"
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
      {boxItems.length > 0 && (
        <div className="section-card rounded-2xl p-4 border border-white/5 mb-5">
          <h3
            data-editor-key="productPage.whatsInTheBox"
            className="font-inter font-semibold text-white/40 text-xs uppercase tracking-widest mb-3"
          >
            {copy.whatsInTheBoxTitle}
          </h3>
          <ul className="text-white/50 text-sm space-y-1.5 font-inter">
            {boxItems.map((item) => (
              <li
                key={item}
                data-editor-key={
                  product.whatsInTheBox.length > 0 ? "product.whatsInTheBox" : "productPage.whatsInTheBox"
                }
                className="flex items-center gap-2.5"
              >
                <CheckCircle2 size={14} className="text-brand-purple shrink-0" strokeWidth={1.5} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price + delivery note */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <div
            data-editor-key="productPage.priceLabel"
            className="text-white/35 text-xs font-inter uppercase tracking-widest mb-0.5"
          >
            {copy.priceLabel}
          </div>
          <div data-editor-key="product.price" className="font-playfair font-bold text-3xl text-white">
            {formatPrice(product.price)}
            {product.onSale && (
              <span className="ml-3 text-white/30 line-through text-lg font-inter font-medium align-middle">
                {formatPrice(product.regularPrice)}
              </span>
            )}
          </div>
          {product.onSale && (
            <div
              data-editor-key="productPage.onSaleFormat"
              className="text-brand-yellow text-xs font-inter font-semibold mt-1"
            >
              {copy.onSaleFormat.replace(
                "{amount}",
                formatPrice(product.regularPrice - product.price),
              )}
            </div>
          )}
        </div>
        <div
          data-editor-key="productPage.delivery"
          className="text-white/30 text-xs text-right font-inter leading-relaxed"
        >
          {copy.deliveryLine1}
          <br />
          {copy.deliveryLine2}
        </div>
      </div>

      <OrderButton product={product} />
      {copy.orderHint && (
        <p
          data-editor-key="productPage.orderHint"
          className="text-white/25 text-xs text-center mt-2.5 font-inter"
        >
          {copy.orderHint}
        </p>
      )}
    </div>
  );
}
