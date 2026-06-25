"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  src?: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  fallbackEmoji: string;
}

export default function ProductImage({ src, alt, fill, sizes, className, fallbackEmoji }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-7xl select-none">
        {fallbackEmoji}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
