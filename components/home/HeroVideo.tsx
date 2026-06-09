"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSiteConfig } from "@/context/SiteConfigContext";

export default function HeroVideo() {
  const { hero } = useSiteConfig();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <section
      className="sticky top-0 h-screen flex flex-col overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {/* Very light vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,15,0.18) 0%, rgba(10,10,15,0.05) 20%, rgba(10,10,15,0.05) 75%, rgba(10,10,15,0.55) 100%)",
        }}
      />

      {/* CTA buttons — split left and right, fade out on scroll */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-between px-6 sm:px-10 lg:px-16 pointer-events-none transition-opacity duration-500"
        style={{ opacity: scrolled ? 0 : 1, pointerEvents: scrolled ? "none" : undefined }}
        data-editor-key="hero.cta"
      >
        <motion.div
          className="pointer-events-auto"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href={hero.ctaPrimaryHref}
            className="btn-yellow px-6 py-3 rounded-full text-sm font-semibold active:scale-95 shadow-lg shadow-black/30"
          >
            {hero.ctaPrimaryLabel}
          </Link>
        </motion.div>

        <motion.div
          className="pointer-events-auto"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href={hero.ctaSecondaryHref}
            className="inline-flex items-center px-6 py-3 rounded-full border border-black/30 text-brand-dark text-sm font-semibold bg-black/10 hover:bg-black/20 transition-all active:scale-95"
          >
            {hero.ctaSecondaryLabel}
          </Link>
        </motion.div>
      </div>

      {/* Scroll prompt */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.8 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="text-black/40" size={18} />
        </motion.div>
      </motion.div>
    </section>
  );
}
