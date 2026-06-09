"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const LANDSCAPE_VIDEO = "/video/hero-landscape.mp4";
const PORTRAIT_VIDEO  = "/video/hero-portrait.mp4";
const LANDSCAPE_GIF   = "/gif/logo-landscape.gif";
const PORTRAIT_GIF    = "/gif/logo-portrait.gif";
const LOAD_TIMEOUT    = 5000;
const STALL_TIMEOUT   = 3000;

const FALLBACK_STYLE: React.CSSProperties = {
  backgroundColor: "#f5be4d",
};

export default function VideoBackground() {
  const [isPortrait, setIsPortrait] = useState(false);
  const [userMuted, setUserMuted]   = useState(true);
  const [interacted, setInteracted] = useState(false);
  const [skipVideo, setSkipVideo]   = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  const vidRef       = useRef<HTMLVideoElement>(null);
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userMutedRef = useRef(true);

  useEffect(() => { userMutedRef.current = userMuted; }, [userMuted]);

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };
  const fallBack = () => { clearTimer(); setSkipVideo(true); };

  // Skip on slow / save-data connection.
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conn = (navigator as any).connection;
    if (conn?.saveData || conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") {
      setSkipVideo(true);
    }
  }, []);

  // Orientation detection.
  useEffect(() => {
    const mq   = window.matchMedia("(orientation: portrait)");
    const pick = () => setIsPortrait(mq.matches);
    pick();
    mq.addEventListener("change", pick);
    return () => mq.removeEventListener("change", pick);
  }, []);

  // On orientation change: reset and replay the appropriate video.
  useEffect(() => {
    if (skipVideo) return;
    setVideoEnded(false);
    clearTimer();
    const v = vidRef.current;
    if (v) {
      v.muted = userMutedRef.current;
      v.load();
      v.play().catch(() => {});
    }
    timerRef.current = setTimeout(fallBack, LOAD_TIMEOUT);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPortrait, skipVideo]);

  // Keep mute in sync.
  useEffect(() => {
    const v = vidRef.current;
    if (v) v.muted = userMuted;
  }, [userMuted]);

  // Resume on tab focus while video is still playing.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible" || videoEnded) return;
      vidRef.current?.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [videoEnded]);

  // Unmute on first interaction.
  useEffect(() => {
    if (interacted) return;
    const unlock = () => {
      setUserMuted(false);
      setInteracted(true);
      const v = vidRef.current;
      if (v) v.muted = false;
    };
    window.addEventListener("click",      unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    return () => {
      window.removeEventListener("click",      unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [interacted]);

  const handleCanPlay  = () => clearTimer();
  const handlePlaying  = () => clearTimer();
  const handleProgress = () => clearTimer();
  const handleStalled  = () => {
    clearTimer();
    timerRef.current = setTimeout(fallBack, STALL_TIMEOUT);
  };
  const handleEnded = () => {
    clearTimer();
    setVideoEnded(true);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !userMuted;
    setUserMuted(next);
    setInteracted(true);
    const v = vidRef.current;
    if (v) v.muted = next;
  };

  const videoSrc = isPortrait ? PORTRAIT_VIDEO : LANDSCAPE_VIDEO;
  const gifSrc   = isPortrait ? PORTRAIT_GIF   : LANDSCAPE_GIF;

  return (
    <>
      <div
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: -1, backgroundColor: "#f5be4d" }}
        aria-hidden="true"
      >
        {skipVideo ? (
          <div className="absolute inset-0 w-full h-full" style={FALLBACK_STYLE} />
        ) : (
          <>
            <img
              key={gifSrc}
              src={gifSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />

            {!videoEnded && (
              <video
                ref={vidRef}
                src={videoSrc}
                playsInline
                autoPlay
                muted
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ backgroundColor: "transparent", pointerEvents: "none" }}
                onCanPlay={handleCanPlay}
                onStalled={handleStalled}
                onWaiting={handleStalled}
                onProgress={handleProgress}
                onPlaying={handlePlaying}
                onEnded={handleEnded}
              />
            )}
          </>
        )}
      </div>

      {/* Mute toggle — only while the hero video is playing */}
      {!skipVideo && !videoEnded && (
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
