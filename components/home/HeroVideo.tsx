"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { whatsappGeneralLink } from "@/lib/whatsapp";

export default function HeroVideo() {
  return (
    <section
      className="sticky top-0 h-screen flex flex-col overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {/* Gradient overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,15,0.60) 0%, rgba(10,10,15,0.35) 45%, rgba(10,10,15,0.85) 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% 110%, rgba(117,67,152,0.32) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 15% 10%, rgba(245,190,77,0.08) 0%, transparent 65%)",
        }}
      />

      {/* ── Navbar spacer — always reserves space for the fixed nav, preventing overlap on production ── */}
      <div className="h-16 md:h-20 shrink-0" aria-hidden="true" />

      {/* ── Content — fills remaining viewport height, centered ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 pb-4 sm:pb-10">
        <div className="w-full max-w-5xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="inline-flex items-center gap-2.5 bg-white/8 backdrop-blur-md border border-brand-yellow/20 rounded-full px-4 py-2 mb-5 sm:mb-8 text-xs sm:text-sm font-inter text-white/80"
          >
            <span className="w-1.5 h-1.5 bg-brand-yellow rounded-full animate-pulse" />
            17 DIY Kit Types · 1–2 Day Nairobi Delivery
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="font-playfair font-black text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] text-white leading-[1.04] mb-4 sm:mb-6 tracking-tight"
          >
            Build Something{" "}
            <em className="text-gradient not-italic">Amazing</em>
            <br className="hidden sm:block" /> Today
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="text-white/60 text-sm sm:text-xl md:text-2xl max-w-2xl mx-auto mb-5 sm:mb-10 leading-relaxed font-inter"
          >
            DIY kits that spark creativity, teach STEM skills, and turn every child into a builder.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
          >
            <Link
              href="/shop"
              className="btn-yellow px-7 py-3.5 sm:px-9 sm:py-4 rounded-full text-sm sm:text-base active:scale-95"
            >
              Shop All Kits →
            </Link>
            <a
              href={whatsappGeneralLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-brand-yellow/35 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white font-semibold px-7 py-3.5 sm:px-9 sm:py-4 rounded-full text-sm sm:text-base transition-all hover:-translate-y-0.5 font-inter"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#25D366]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.15 }}
            className="mt-6 sm:mt-14 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4 sm:gap-10 w-full text-center"
          >
            {[
              { value: "17",        label: "Kit Types"         },
              { value: "Ages 5–14", label: "All Ages Covered"  },
              { value: "KES 850",   label: "Starting From"     },
              { value: "1–2 Days",  label: "Nairobi Delivery"  },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl font-playfair font-bold text-brand-yellow leading-none">
                  {stat.value}
                </div>
                <div className="text-white/35 text-[10px] sm:text-xs mt-1.5 tracking-widest uppercase font-inter">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="text-brand-yellow/50" size={26} />
      </motion.div>
    </section>
  );
}
