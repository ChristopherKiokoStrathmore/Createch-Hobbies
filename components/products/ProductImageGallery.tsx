"use client";

import { useState } from "react";
import ProductImage from "./ProductImage";

interface Props {
  images: string[];
  productName: string;
  fallbackEmoji: string;
}

export default function ProductImageGallery({ images, productName, fallbackEmoji }: Props) {
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="aspect-[4/3] relative bg-[#120e1e] rounded-2xl overflow-hidden border border-white/6">
        <ProductImage
          src={images[active]}
          alt={productName}
          fill
          className="object-cover transition-opacity duration-200"
          fallbackEmoji={fallbackEmoji}
        />
      </div>

      {/* Thumbnails — click to swap main image */}
      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative w-16 h-16 rounded-xl overflow-hidden bg-[#120e1e] border-2 transition-all duration-150 ${
                i === active
                  ? "border-brand-yellow scale-105"
                  : "border-white/8 hover:border-white/30"
              }`}
            >
              <ProductImage
                src={img}
                alt={`${productName} — view ${i + 1}`}
                fill
                className="object-cover"
                fallbackEmoji={fallbackEmoji}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
