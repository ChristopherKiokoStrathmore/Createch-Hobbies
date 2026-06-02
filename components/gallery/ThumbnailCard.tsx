"use client";

import { Play } from "lucide-react";
import type { GalleryVideo } from "@/lib/gallery-videos";

interface Props {
  video: GalleryVideo;
  index: number;
  onClick: (index: number) => void;
}

export default function ThumbnailCard({ video, index, onClick }: Props) {
  const poster = `/videos/posters/${video.filename.replace(/\.mp4$/, ".jpg")}`;

  return (
    <button
      onClick={() => onClick(index)}
      className="relative rounded-xl overflow-hidden bg-white/5 cursor-pointer group w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
    >
      <div className="aspect-[9/16]">
        <img
          src={poster}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
        <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm border border-white/30 flex items-center justify-center">
          <Play size={18} className="text-white fill-white translate-x-0.5" />
        </div>
      </div>
    </button>
  );
}
