"use client";

import { useState } from "react";
import { whatsappSubscribeLink } from "@/lib/whatsapp";

export default function NewsletterCapture() {
  const [name, setName] = useState("");

  const handleSubscribe = () => {
    if (!name.trim()) return;
    window.open(whatsappSubscribeLink(name.trim()), "_blank", "noopener,noreferrer");
    setName("");
  };

  return (
    <div
      className="rounded-2xl p-6 mb-12"
      style={{
        background: "linear-gradient(135deg, rgba(117,67,152,0.10) 0%, rgba(245,190,77,0.05) 100%)",
        border: "1px solid rgba(245,190,77,0.12)",
      }}
    >
      <h3 className="font-playfair font-bold text-white text-lg mb-1">
        Stay Updated
      </h3>
      <p className="text-white/40 text-sm font-inter mb-4">
        New kits, promotions, and STEM ideas — straight to your WhatsApp.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Your first name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
          className="w-full sm:flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/25 text-sm font-inter focus:outline-none focus:border-brand-yellow/30 transition-colors"
        />
        <button
          onClick={handleSubscribe}
          className="w-full sm:w-auto shrink-0 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors font-inter"
        >
          Subscribe via WhatsApp
        </button>
      </div>
    </div>
  );
}
