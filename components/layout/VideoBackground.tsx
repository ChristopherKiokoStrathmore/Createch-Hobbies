"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const LANDSCAPE_SRC  = "/video/hero-landscape.mp4";
const PORTRAIT_SRC   = "/video/hero-portrait.mp4";
const LOAD_TIMEOUT   = 5000; // ms to wait for first canplay before falling back
const STALL_TIMEOUT  = 3000; // ms to wait after a stall/waiting event before falling back

// Dark purple gradient matching the video's colour palette — shown on slow networks
// or whenever the video hangs.
const FALLBACK_STYLE: React.CSSProperties = {
  background: "linear-gradient(135deg, #0f0a1a 0%, #1a0a2e 45%, #0a0f1a 100%)",
};

export default function VideoBackground() {
  const [src, setSrc]               = useState<string>(LANDSCAPE_SRC);
  const [userMuted, setUserMuted]   = useState(true);
  const [interacted, setInteracted] = useState(false);
  const [skipVideo, setSkipVideo]   = useState(false);
  const videoRef   = useRef<HTMLVideoElement>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const fallBack = () => {
    clearTimer();
    setSkipVideo(true);
  };

  // Skip immediately if the device reports a slow or data-saving connection.
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conn = (navigator as any).connection;
    if (
      conn?.saveData ||
      conn?.effectiveType === "slow-2g" ||
      conn?.effectiveType === "2g"
    ) {
      setSkipVideo(true);
    }
  }, []);

  // Orientation: pick the right src on mount and swap on change.
  useEffect(() => {
    const mq   = window.matchMedia("(orientation: portrait)");
    const pick = () => setSrc(mq.matches ? PORTRAIT_SRC : LANDSCAPE_SRC);
    pick();
    mq.addEventListener("change", pick);
    return () => mq.removeEventListener("change", pick);
  }, []);

  // Each time src changes, arm a load timeout. canPlay clears it.
  useEffect(() => {
    if (skipVideo) return;
    clearTimer();
    timerRef.current = setTimeout(fallBack, LOAD_TIMEOUT);
    return clearTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, skipVideo]);

  // After every key-remount restore mute preference and nudge play.
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = userMuted;
    if (vid.paused) vid.play().catch(() => {});
  }, [src, userMuted]);

  // Tab visibility: resume when tab becomes visible.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        videoRef.current?.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // Unmute on first user interaction anywhere on the page.
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

  const handleCanPlay = () => clearTimer();

  const handleStalled = () => {
    // Video stalled mid-play — give it a short grace period then fall back.
    clearTimer();
    timerRef.current = setTimeout(fallBack, STALL_TIMEOUT);
  };

  // If data arrives again before the stall timer fires, cancel the fallback.
  const handleProgress  = () => clearTimer();
  const handlePlaying   = () => clearTimer();

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
        {skipVideo ? (
          <div className="absolute inset-0 w-full h-full" style={FALLBACK_STYLE} />
        ) : (
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
            style={{ backgroundColor: "#0a0a0f" }}
            onCanPlay={handleCanPlay}
            onStalled={handleStalled}
            onWaiting={handleStalled}
            onProgress={handleProgress}
            onPlaying={handlePlaying}
          />
        )}
      </div>

      {!skipVideo && (
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
      )}
    </>
  );
}
