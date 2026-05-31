"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading]   = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true),  1500);
    const hideTimer = setTimeout(() => setVisible(false), 2100);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position:        "fixed",
        inset:           0,
        zIndex:          9999,
        display:         "flex",
        flexDirection:   "column",
        alignItems:      "center",
        justifyContent:  "center",
        backgroundColor: "#0a0a0f",
        transition:      "opacity 0.6s ease",
        opacity:         fading ? 0 : 1,
        pointerEvents:   fading ? "none" : "all",
      }}
    >
      {/* Purple centre glow */}
      <div style={{
        position:      "absolute",
        inset:         0,
        background:    "radial-gradient(ellipse 90% 70% at 50% 50%, rgba(117,67,152,0.35) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      {/* Yellow corner accent */}
      <div style={{
        position:      "absolute",
        inset:         0,
        background:    "radial-gradient(ellipse 55% 45% at 8% 8%, rgba(245,190,77,0.13) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 24px" }}>

        {/* Logo — scale + fade entrance */}
        <div style={{ animation: "splashLogoIn 0.6s cubic-bezier(0.22,1,0.36,1) both" }}>
          <div style={{
            position: "relative",
            width:    "min(72vw, 300px)",
            height:   "min(32vw, 136px)",
            margin:   "0 auto 28px",
          }}>
            <Image
              src="/images/logo.png"
              alt="Createch Hobbies"
              fill
              priority
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Tagline */}
        <p style={{
          fontFamily:    "'Playfair Display', Georgia, serif",
          fontSize:      "clamp(0.8rem, 3vw, 1rem)",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color:         "rgba(245,190,77,0.60)",
          margin:        "0 0 28px",
          animation:     "splashFadeUp 0.7s 0.25s ease both",
        }}>
          Build Something Amazing
        </p>

        {/* Progress bar */}
        <div style={{
          width:        "min(72vw, 300px)",
          height:       3,
          borderRadius: 999,
          background:   "rgba(255,255,255,0.07)",
          overflow:     "hidden",
          margin:       "0 auto",
          animation:    "splashFadeUp 0.5s 0.3s ease both",
        }}>
          <div style={{
            height:       "100%",
            borderRadius: 999,
            background:   "linear-gradient(90deg, #754398, #f5be4d)",
            animation:    "splashBar 1.5s ease-out forwards",
          }} />
        </div>
      </div>

      <style>{`
        @keyframes splashLogoIn {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes splashFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
