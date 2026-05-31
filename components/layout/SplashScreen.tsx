"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading]   = useState(false);

  useEffect(() => {
    // Start fade-out at 1.4 s, fully gone at 1.9 s
    const fadeTimer = setTimeout(() => setFading(true),  1400);
    const hideTimer = setTimeout(() => setVisible(false), 1900);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position:         "fixed",
        inset:            0,
        zIndex:           9999,
        display:          "flex",
        flexDirection:    "column",
        alignItems:       "center",
        justifyContent:   "center",
        backgroundColor:  "#0a0a0f",
        transition:       "opacity 0.5s ease",
        opacity:          fading ? 0 : 1,
        pointerEvents:    fading ? "none" : "all",
      }}
    >
      {/* Purple radial glow */}
      <div
        style={{
          position:   "absolute",
          inset:      0,
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(117,67,152,0.28) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      {/* Yellow top-left accent */}
      <div
        style={{
          position:   "absolute",
          inset:      0,
          background: "radial-gradient(ellipse 50% 40% at 10% 10%, rgba(245,190,77,0.10) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div
          style={{
            position:     "relative",
            width:        180,
            height:       80,
            marginBottom: 24,
            margin:       "0 auto 24px",
          }}
        >
          <Image
            src="/images/logo.png"
            alt="Createch Hobbies"
            fill
            priority
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Brand name fallback text (hidden if logo loads) */}
        <p
          style={{
            fontFamily:    "'Playfair Display', Georgia, serif",
            fontSize:      "0.75rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color:         "rgba(245,190,77,0.55)",
            marginTop:     8,
          }}
        >
          Build Something Amazing
        </p>

        {/* Loading bar */}
        <div
          style={{
            marginTop:       20,
            width:           120,
            height:          2,
            borderRadius:    999,
            background:      "rgba(255,255,255,0.08)",
            overflow:        "hidden",
            marginLeft:      "auto",
            marginRight:     "auto",
          }}
        >
          <div
            style={{
              height:     "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, #754398, #f5be4d)",
              animation:  "splashBar 1.4s ease-out forwards",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes splashBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
