"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";

// Defence in depth: the config PUT already scrubs this, but never hand an
// unvalidated string to <Link href> — block javascript:/data: and friends.
function safeHref(href: string): string | null {
  const s = (href ?? "").trim();
  if (s === "") return null;
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  try {
    const u = new URL(s);
    if (u.protocol === "http:" || u.protocol === "https:") return s;
  } catch { /* not absolute */ }
  return null;
}

export default function AnnouncementBanner() {
  const { banner } = useSiteConfig();
  const [dismissed, setDismissed] = useState(false);

  if (!banner.enabled || dismissed) return null;

  const href = safeHref(banner.link);

  return (
    <div
      className="relative flex items-center justify-center gap-2 px-4 py-2 text-sm font-inter font-medium text-center"
      style={{ backgroundColor: banner.bgColor, color: banner.textColor }}
      data-editor-key="banner"
    >
      <span>{banner.text}</span>
      {href && banner.linkLabel && (
        <Link
          href={href}
          className="underline underline-offset-2 font-semibold hover:opacity-80 transition-opacity"
          style={{ color: banner.textColor }}
        >
          {banner.linkLabel}
        </Link>
      )}
      {banner.dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:opacity-70 transition-opacity"
          aria-label="Dismiss banner"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
