"use client";

import { useRef, useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function VideoBackground() {
  const landscapeRef = useRef<HTMLVideoElement>(null);
  const portraitRef  = useRef<HTMLVideoElement>(null);
  const mutedRef     = useRef(true);
  const [mutedUI, setMutedUI] = useState(true);
  const [interacted, setInteracted] = useState(false);

  const isPortrait = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(orientation: portrait)").matches;

  useEffect(() => {
    const land = landscapeRef.current;
    const port = portraitRef.current;
    if (!land || !port) return;

    land.muted = true;
    port.muted = true;

    const getActive   = () => (isPortrait() ? port : land);
    const getInactive = () => (isPortrait() ? land : port);

    /* Resume active video and silence inactive */
    const sync = () => {
      const active   = getActive();
      const inactive = getInactive();

      if (!inactive.paused) {
        inactive.pause();
        inactive.muted = true;
      }

      active.muted = mutedRef.current;
      if (active.paused && !active.ended) {
        active.play().catch(() => {});
      }
    };

    /* ─── pause event — fires the instant the browser pauses either video */
    const onLandPause = () => { if (getActive() === land) sync(); };
    const onPortPause = () => { if (getActive() === port) sync(); };
    land.addEventListener("pause", onLandPause);
    port.addEventListener("pause", onPortPause);

    /* ─── 500 ms heartbeat — safety net for any pause the event misses */
    const interval = setInterval(sync, 500);

    /* ─── Orientation swap */
    const mq = window.matchMedia("(orientation: portrait)");
    mq.addEventListener("change", sync);

    /* ─── Tab visibility */
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisible);

    /* Kick off immediately */
    sync();

    return () => {
      clearInterval(interval);
      land.removeEventListener("pause", onLandPause);
      port.removeEventListener("pause", onPortPause);
      mq.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  /* ─── Unmute on first click / tap */
  useEffect(() => {
    if (interacted) return;

    const unlock = () => {
      mutedRef.current = false;
      setMutedUI(false);
      setInteracted(true);
    };

    window.addEventListener("click",      unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });

    return () => {
      window.removeEventListener("click",      unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [interacted]);

  /* ─── Manual mute toggle */
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMutedUI(next);
    setInteracted(true);

    const active = isPortrait() ? portraitRef.current : landscapeRef.current;
    if (active) active.muted = next;
  };

  return (
    <>
      <div
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: -1 }}
        aria-hidden="true"
      >
        <video
          ref={landscapeRef}
          className="hero-vid-landscape absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/hero-poster.jpg"
        >
          <source src="/video/hero-landscape.mp4" type="video/mp4" />
        </video>

        <video
          ref={portraitRef}
          className="hero-vid-portrait absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/hero-poster.jpg"
        >
          <source src="/video/hero-portrait.mp4" type="video/mp4" />
        </video>
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
