"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface Props {
  src: string;
  poster: string;
  id: string;
  activeId: string | null;
  onActivate: (id: string | null) => void;
}

export default function VideoCard({ src, poster, id, activeId, onActivate }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const [inView, setInView]     = useState(false);
  const [loaded, setLoaded]     = useState(false);
  const isActive = activeId === id;

  /* ── Intersection observer: play when ≥40% visible ── */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── Play / pause on visibility change ── */
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (inView) {
      vid.muted = !isActive;
      vid.play().catch(() => {});
    } else {
      vid.pause();
      // If scrolled out while active, deactivate
      if (isActive) onActivate(null);
    }
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Sync mute when active video changes ── */
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !inView) return;
    vid.muted = !isActive;
    if (isActive && vid.paused) vid.play().catch(() => {});
  }, [isActive, inView]);

  const handleClick = useCallback(() => {
    onActivate(isActive ? null : id);
  }, [isActive, id, onActivate]);

  return (
    <div
      ref={wrapRef}
      onClick={handleClick}
      className="relative rounded-xl overflow-hidden bg-white/5 cursor-pointer group select-none"
    >
      {/* 9:16 portrait container */}
      <div className="aspect-[9/16]">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          loop
          muted
          playsInline
          preload="metadata"
          onLoadedMetadata={() => setLoaded(true)}
          className="w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: loaded ? 1 : 0 }}
        />
        {/* Poster shown until video metadata loads */}
        {!loaded && (
          <img
            src={poster}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      {/* Dark gradient at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

      {/* Sound toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); handleClick(); }}
        aria-label={isActive ? "Mute" : "Unmute"}
        className="absolute bottom-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 transition-all group-hover:border-brand-yellow/40"
      >
        {isActive
          ? <Volume2 size={14} className="text-brand-yellow" />
          : <VolumeX  size={14} className="text-white/50 group-hover:text-white/80 transition-colors" />
        }
      </button>

      {/* "Now playing" ring when active */}
      {isActive && (
        <div className="absolute inset-0 ring-2 ring-brand-yellow/60 rounded-xl pointer-events-none" />
      )}
    </div>
  );
}
