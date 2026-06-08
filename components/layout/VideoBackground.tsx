"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const LANDSCAPE_SRC = "/video/hero-landscape.mp4";
const PORTRAIT_SRC  = "/video/hero-portrait.mp4";

export default function VideoBackground() {
  // Start with landscape so the browser begins fetching immediately on first render.
  // The orientation effect below swaps to portrait if needed after mount.
  const [src, setSrc]               = useState<string>(LANDSCAPE_SRC);
  const [userMuted, setUserMuted]   = useState(true);
  const [interacted, setInteracted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* ── Pick the right src on mount; swap on orientation change ── */
  useEffect(() => {
    const mq   = window.matchMedia("(orientation: portrait)");
    const pick = () => setSrc(mq.matches ? PORTRAIT_SRC : LANDSCAPE_SRC);

    pick(); // set immediately on client
    mq.addEventListener("change", pick);
    return () => mq.removeEventListener("change", pick);
  }, []);

  /*
   * After every key-remount (src change), the new video element starts
   * muted (required for autoplay). Restore the user's actual preference.
   */
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = userMuted;

    // Extra insurance: if autoPlay somehow didn't fire, nudge it.
    if (vid.paused) vid.play().catch(() => {});
  }, [src, userMuted]);

  /* ── Tab visibility ── */
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        const vid = videoRef.current;
        if (vid?.paused) vid.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  /* ── Unmute on first tap / click anywhere ── */
  useEffect(() => {
    if (interacted) return;
    const unlock = () => {
      setUserMuted(false);
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
    const next = !userMuted;
    setUserMuted(next);
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
        <video
          key={src}
          ref={videoRef}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ backgroundColor: '#0a0a0f' }}
        />
      </div>

      <button
        onClick={toggleMute}
        aria-label={userMuted ? "Unmute video" : "Mute video"}
        className="fixed top-[4.5rem] left-4 z-50 flex items-center gap-2 bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/15 hover:border-brand-yellow/40 px-3.5 py-2 rounded-full transition-all duration-200 text-xs font-inter group"
      >
        {userMuted ? (
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
