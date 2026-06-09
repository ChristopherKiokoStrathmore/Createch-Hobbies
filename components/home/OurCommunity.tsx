"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VideoCard from "@/components/gallery/VideoCard";
import { featuredVideos } from "@/lib/gallery-videos";

interface ExpandedVideo {
  id: string;
  src: string;
  poster: string;
}

function VideoModal({ video, onClose }: { video: ExpandedVideo; onClose: () => void }) {
  const vidRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => { if (v) { v.muted = true; v.play().catch(() => {}); } });
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

      <motion.div
        className="relative w-full max-w-xs sm:max-w-sm"
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 24 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
          aria-label="Close video"
        >
          <X size={16} className="text-white" />
        </button>

        <div className="rounded-2xl overflow-hidden aspect-[9/16]">
          <video
            ref={vidRef}
            src={video.src}
            poster={video.poster}
            loop
            playsInline
            controls
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function OurCommunity() {
  const [activeId, setActiveId]       = useState<string | null>(null);
  const [expanded, setExpanded]       = useState<ExpandedVideo | null>(null);

  const handleExpand = (id: string) => {
    const v = featuredVideos.find((x) => x.id === id);
    if (!v) return;
    setExpanded({
      id: v.id,
      src: `/videos/${v.filename}`,
      poster: `/videos/posters/${v.filename.replace(/\.mp4$/, ".jpg")}`,
    });
  };

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

        {/* Grid: 2-col on mobile, 4-col on sm+ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {featuredVideos.map((v) => (
            <VideoCard
              key={v.id}
              id={v.id}
              src={`/videos/${v.filename}`}
              poster={`/videos/posters/${v.filename.replace(/\.mp4$/, ".jpg")}`}
              activeId={activeId}
              onActivate={setActiveId}
              onExpand={handleExpand}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/20 text-white hover:bg-white hover:text-brand-dark font-inter text-sm font-semibold transition-all duration-200"
          >
            View Full Gallery
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>

      <AnimatePresence>
        {expanded && (
          <VideoModal video={expanded} onClose={() => setExpanded(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
