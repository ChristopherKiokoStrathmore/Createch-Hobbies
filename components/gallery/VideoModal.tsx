"use client";

import { useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryVideo } from "@/lib/gallery-videos";

interface Props {
  videos: GalleryVideo[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function VideoModal({ videos, index, onClose, onNavigate }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const current  = videos[index];

  const prev = useCallback(() => onNavigate((index - 1 + videos.length) % videos.length), [index, videos.length, onNavigate]);
  const next = useCallback(() => onNavigate((index + 1) % videos.length),                 [index, videos.length, onNavigate]);

  /* ── Lock body scroll ── */
  useEffect(() => {
    const savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = savedOverflow; };
  }, []);

  /* ── Keyboard nav ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowLeft")   prev();
      if (e.key === "ArrowRight")  next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, onClose]);

  /* ── Autoplay with sound each time index changes ── */
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = false;
    vid.currentTime = 0;
    vid.play().catch(() => {
      // Fallback: some browsers need muted first, then unmute
      vid.muted = true;
      vid.play().then(() => { vid.muted = false; }).catch(() => {});
    });
  }, [index]);

  return (
    /* Backdrop — click outside to close */
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Prev arrow */}
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        aria-label="Previous video"
        className="hidden sm:flex absolute left-4 lg:left-10 items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all z-10"
      >
        <ChevronLeft size={22} className="text-white" />
      </button>

      {/* Video container */}
      <div
        className="relative flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-10 right-0 sm:right-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all z-10"
        >
          <X size={16} className="text-white" />
        </button>

        {/* Video — key forces full remount on index change (stops previous audio) */}
        <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl"
             style={{ height: "min(85vh, 640px)", aspectRatio: "9/16" }}>
          <video
            key={current.id}
            ref={videoRef}
            src={`/videos/${current.filename}`}
            autoPlay
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Counter */}
        <p className="mt-3 text-white/40 text-xs font-inter tabular-nums">
          {index + 1} / {videos.length}
        </p>

        {/* Mobile nav arrows */}
        <div className="flex sm:hidden gap-6 mt-3">
          <button
            onClick={prev}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <button
            onClick={next}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Next arrow */}
      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        aria-label="Next video"
        className="hidden sm:flex absolute right-4 lg:right-10 items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all z-10"
      >
        <ChevronRight size={22} className="text-white" />
      </button>
    </div>
  );
}
