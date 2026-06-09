"use client";

import { useEffect, useState, useCallback } from "react";
import { useIsEditorMode, useInspectMode } from "@/context/SiteConfigContext";

const KEY_LABELS: Record<string, string> = {
  "hero.headline":    "Hero · Headline",
  "hero.subheadline": "Hero · Subheadline",
  "hero.cta":         "Hero · Buttons",
  "nav":              "Navigation Links",
  "banner":           "Announcement Banner",
  "howItWorks":       "How It Works",
  "howItWorks.steps": "How It Works · Steps",
  "footer.tagline":   "Footer · Tagline",
  "whatsapp":         "WhatsApp Settings",
  "seo":              "SEO",
  "colours":          "Colours",
  "cardStyle":        "Component Style",
  "trustBar":         "Trust Bar",
  "whyCreatech":      "Why Createch",
  "testimonials":     "Testimonials",
  "whatsAppCTA":      "WhatsApp CTA",
  "newsletter":       "Newsletter",
};

interface Highlight {
  top: number;
  left: number;
  width: number;
  height: number;
  key: string;
}

export default function EditorOverlay() {
  const isEditor      = useIsEditorMode();
  const inspectActive = useInspectMode();
  const [hl, setHl]   = useState<Highlight | null>(null);

  const findTarget = useCallback((x: number, y: number): HTMLElement | null => {
    const els = document.elementsFromPoint(x, y);
    for (const el of els) {
      const t = el.closest("[data-editor-key]") as HTMLElement | null;
      if (t) return t;
    }
    return null;
  }, []);

  useEffect(() => {
    if (!isEditor || !inspectActive) {
      setHl(null);
      return;
    }

    const onMove = (e: MouseEvent) => {
      const target = findTarget(e.clientX, e.clientY);
      if (target) {
        const r = target.getBoundingClientRect();
        setHl({ top: r.top, left: r.left, width: r.width, height: r.height, key: target.dataset.editorKey ?? "" });
      } else {
        setHl(null);
      }
    };

    const onClick = (e: MouseEvent) => {
      const target = findTarget(e.clientX, e.clientY);
      if (!target) return;
      e.preventDefault();
      e.stopPropagation();
      window.parent.postMessage({ type: "INSPECT_ELEMENT", key: target.dataset.editorKey ?? "" }, "*");
    };

    const onLeave = () => setHl(null);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("click", onClick, true);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [isEditor, inspectActive, findTarget]);

  if (!isEditor || !inspectActive || !hl) return null;

  const label    = KEY_LABELS[hl.key] ?? hl.key;
  const labelAbove = hl.top > 30;

  return (
    <div
      aria-hidden="true"
      style={{
        position:        "fixed",
        top:             hl.top    - 2,
        left:            hl.left   - 2,
        width:           hl.width  + 4,
        height:          hl.height + 4,
        border:          "2px solid #5b9cf6",
        borderRadius:    "4px",
        pointerEvents:   "none",
        zIndex:          99999,
        backgroundColor: "rgba(91,156,246,0.07)",
        boxSizing:       "border-box",
      }}
    >
      <span
        style={{
          position:    "absolute",
          [labelAbove ? "top" : "bottom"]: "-24px",
          left:        "-2px",
          background:  "#5b9cf6",
          color:       "#fff",
          fontSize:    "10px",
          fontFamily:  "Inter, sans-serif",
          fontWeight:  600,
          padding:     "3px 7px",
          borderRadius: labelAbove ? "3px 3px 3px 0" : "0 3px 3px 3px",
          whiteSpace:  "nowrap",
          letterSpacing: "0.03em",
          lineHeight:  1.4,
          userSelect:  "none",
        }}
      >
        {label}
      </span>
      <span
        style={{
          position:    "absolute",
          bottom:      "4px",
          right:       "6px",
          background:  "rgba(91,156,246,0.85)",
          color:       "#fff",
          fontSize:    "9px",
          fontFamily:  "Inter, sans-serif",
          padding:     "2px 5px",
          borderRadius: "3px",
          letterSpacing: "0.04em",
          userSelect:  "none",
        }}
      >
        click to edit
      </span>
    </div>
  );
}
