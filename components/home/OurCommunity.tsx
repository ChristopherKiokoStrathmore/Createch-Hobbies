"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import VideoCard from "@/components/gallery/VideoCard";
import { featuredVideos } from "@/lib/gallery-videos";

export default function OurCommunity() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section className="bg-brand-dark py-14 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full border border-brand-yellow/30 text-brand-yellow text-xs font-inter tracking-widest uppercase mb-4">
            Our Community
          </span>
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            See It{" "}
            <span className="text-brand-yellow italic">In Action</span>
          </h2>
          <p className="text-white/60 font-inter text-sm sm:text-base max-w-lg mx-auto">
            Real kids. Real builds. Real moments from events across Kenya.
          </p>
        </div>

        {/* Desktop: 3-column grid | Mobile: horizontal snap scroll */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-4 mb-10">
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

        {/* Mobile: snap scroll */}
        <div className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 mb-8 scrollbar-none">
          {featuredVideos.map((v) => (
            <div key={v.id} className="snap-center shrink-0 w-[72vw]">
              <VideoCard
                id={v.id}
                src={`/videos/${v.filename}`}
                poster={`/videos/posters/${v.filename.replace(/\.mp4$/, ".jpg")}`}
                activeId={activeId}
                onActivate={setActiveId}
              />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-brand-yellow/40 text-brand-yellow hover:bg-brand-yellow hover:text-brand-dark font-inter text-sm font-semibold transition-all duration-200"
          >
            View Full Gallery
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
