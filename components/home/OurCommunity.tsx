"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import VideoCard from "@/components/gallery/VideoCard";
import { featuredVideos } from "@/lib/gallery-videos";

export default function OurCommunity() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section className="bg-brand-dark py-8 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full border border-brand-purple/30 text-brand-purple text-xs font-inter tracking-widest uppercase mb-4">
            Our Community
          </span>
          <h2 className="font-playfair text-xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            See It{" "}
            <span className="text-brand-purple italic">In Action</span>
          </h2>
          <p className="text-white/60 font-inter text-sm sm:text-base max-w-lg mx-auto">
            Real kids. Real builds. Real moments from events across Kenya.
          </p>
        </div>

        {/* Grid: 2-col on mobile, 3-col on sm+ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {featuredVideos.map((v) => (
            <VideoCard
              key={v.id}
              id={v.id}
              src={`/videos/${v.filename}`}
              poster={`/videos/posters/${v.filename.replace(/\.mp4$/, ".jpg")}`}
              activeId={activeId}
              onActivate={setActiveId}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-brand-dark/25 text-brand-dark hover:bg-brand-dark hover:text-brand-yellow font-inter text-sm font-semibold transition-all duration-200"
          >
            View Full Gallery
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
