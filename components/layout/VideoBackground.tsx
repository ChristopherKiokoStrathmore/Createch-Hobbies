"use client";

import { useRef, useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const LANDSCAPE_SRC = "/video/hero-landscape.mp4";
const PORTRAIT_SRC  = "/video/hero-portrait.mp4";

export default function VideoBackground() {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const mutedRef   = useRef(true);
  const activeSrc  = useRef("");
  const [mutedUI, setMutedUI]     = useState(true);
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const getSrc = () =>
      window.matchMedia("(orientation: portrait)").matches
        ? PORTRAIT_SRC
        : LANDSCAPE_SRC;

    const tryPlay = () => {
      vid.muted = mutedRef.current;
      if (vid.paused && !vid.ended) vid.play().catch(() => {});
    };

    const loadSrc = () => {
      const src = getSrc();
      if (activeSrc.current === src) { tryPlay(); return; }
      activeSrc.current = src;
      vid.src = src;
      vid.muted = mutedRef.current;
      vid.load();
      // play() after load — will likely fail until canplay, but canplay will retry
      vid.play().catch(() => {});
    };

    // canplay is the reliable mobile hook — fires when browser has enough data
    vid.addEventListener("canplay", tryPlay);

    // 500 ms heartbeat — safety net for any edge case
    const interval = setInterval(tryPlay, 500);

    // Orientation change → swap src
    const mq = window.matchMedia("(orientation: portrait)");
    mq.addEventListener("change", loadSrc);

    // Tab regains focus → ensure playing
    const onVisible = () => {
      if (document.visibilityState === "visible") loadSrc();
    };
    document.addEventListener("visibilitychange", onVisible);

    // Initial load
    loadSrc();

    return () => {
      clearInterval(interval);
      vid.removeEventListener("canplay", tryPlay);
      mq.removeEventListener("change", loadSrc);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Unmute on first click / tap
  useEffect(() => {
    if (interacted) return;
    const unlock = () => {
      mutedRef.current = false;
      setMutedUI(false);
      setInteracted(true);
      const vid = videoRef.current;
      if (vid) vid.muted = false;
    };
    window.addEventListener("click",      unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    return () => {
      window.removeEventListener("click",      unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [interacted]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMutedUI(next);
    setInteracted(true);
    const vid = videoRef.current;
    if (vid) vid.muted = next;
  };

  return (
    <>
      <div
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: -1 }}
        aria-hidden="true"
      >
        {/* Single video element — src is swapped via JS based on orientation */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/hero-poster.jpg"
        />
      </div>

      <button
        onClick={toggleMute}
        aria-label={mutedUI ? "Unmute video" : "Mute video"}
        className="fixed top-[4.5rem] left-4 z-50 flex items-center gap-2 bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/15 hover:border-brand-yellow/40 px-3.5 py-2 rounded-full transition-all duration-200 text-xs font-inter group"
      >
        {mutedUI ? (
          <>
            <VolumeX size={14} className="text-white/50 group-hover:text-brand-yellow transition-colors" />
            <span className="text-white/60 group-hover:text-white transition-colors">
              {interacted ? "Unmute" : "Tap for sound"}
            </span>
          </>
        ) : (
          <>
            <Volume2 size={14} className="text-brand-yellow" />
            <span className="text-brand-yellow">Mute</span>
          </>
        )}
      </button>
    </>
  );
}
