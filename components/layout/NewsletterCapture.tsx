"use client";

import { useState } from "react";
import { whatsappSubscribeLink } from "@/lib/whatsapp";
import { useSiteConfig } from "@/context/SiteConfigContext";

export default function NewsletterCapture() {
  const { newsletter } = useSiteConfig();
  const [name, setName] = useState("");

  const handleSubscribe = () => {
    if (!name.trim()) return;
    window.open(whatsappSubscribeLink(name.trim()), "_blank", "noopener,noreferrer");
    setName("");
  };

  return (
    <div
      className="rounded-2xl p-6 mb-12"
      data-editor-key="newsletter"
      style={{ background: "rgba(255,255,255,0.35)", border: "1px solid rgba(10,10,15,0.12)" }}
    >
      <h3 className="font-playfair font-bold text-brand-dark text-lg mb-1">
        {newsletter.title}
      </h3>
      <p className="text-brand-dark/55 text-sm font-inter mb-4">
        {newsletter.subtitle}
      </p>
      <div className="flex flex-row gap-2">
        <input
          type="text"
          placeholder="Your first name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
          className="flex-1 min-w-0 bg-white/60 border border-brand-dark/20 rounded-xl px-4 py-2.5 text-brand-dark placeholder:text-brand-dark/40 text-sm font-inter focus:outline-none focus:border-brand-purple/50 transition-colors"
        />
        <button
          onClick={handleSubscribe}
          className="shrink-0 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors font-inter"
        >
          Subscribe via WhatsApp
        </button>
      </div>
    </div>
  );
}
