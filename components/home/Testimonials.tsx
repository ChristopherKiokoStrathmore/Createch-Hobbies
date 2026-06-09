"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { whatsappGeneralLink } from "@/lib/whatsapp";
import { useSiteConfig } from "@/context/SiteConfigContext";

const AVATAR_STYLES = [
  { bg: "rgba(245,190,77,0.90)",  border: "rgba(245,190,77,0.40)"  },
  { bg: "rgba(117,67,152,0.20)",  border: "rgba(117,67,152,0.30)"  },
  { bg: "rgba(245,190,77,0.90)",  border: "rgba(245,190,77,0.40)"  },
  { bg: "rgba(117,67,152,0.20)",  border: "rgba(117,67,152,0.30)"  },
];

export default function Testimonials() {
  const { testimonials } = useSiteConfig();
  const [selected, setSelected] = useState<number | null>(null);

  const words      = testimonials.sectionTitle.split(" ");
  const titleStart = words.slice(0, -2).join(" ");
  const titleEnd   = words.slice(-2).join(" ");

  const active = selected !== null ? testimonials.items[selected] : null;
  const activeStyle = selected !== null ? (AVATAR_STYLES[selected] ?? AVATAR_STYLES[0]) : null;

  return (
    <section className="section-alt py-8 sm:py-28 px-4 sm:px-6" data-editor-key="testimonials">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-14"
        >
          <span className="text-brand-purple-light font-inter font-semibold text-xs uppercase tracking-[0.2em]">
            {testimonials.sectionLabel}
          </span>
          <h2 className="font-playfair font-bold text-xl sm:text-4xl md:text-5xl text-white mt-3 sm:mt-4">
            {titleStart}{" "}
            <em className="text-gradient not-italic">{titleEnd}</em>
          </h2>
          <p className="text-white/35 text-sm font-inter mt-3">
            Early feedback from our first customers
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 mb-8 items-stretch">
          {testimonials.items.map((r, i) => {
            const style = AVATAR_STYLES[i] ?? AVATAR_STYLES[0];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onClick={() => setSelected(i)}
                className="rounded-2xl p-3 sm:p-7 flex flex-col h-full cursor-pointer active:scale-95 transition-transform"
                style={{
                  background: "rgba(255,246,220,0.70)",
                  border:     `1px solid ${style.border}`,
                  boxShadow:  "0 2px 24px rgba(10,10,15,0.06)",
                }}
              >
                <div className="text-brand-purple font-playfair text-2xl sm:text-5xl leading-none mb-1 sm:mb-3 select-none">&ldquo;</div>
                <p className="text-brand-dark/70 leading-relaxed text-[10px] sm:text-base font-inter mb-3 sm:mb-6 flex-1 line-clamp-3 sm:line-clamp-none">{r.text}</p>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className="w-5 h-5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold text-brand-dark shrink-0"
                    style={{ background: style.bg }}
                  >
                    {r.name[0]}
                  </div>
                  <div>
                    <div className="font-inter font-semibold text-brand-dark text-[10px] sm:text-base">{r.name}</div>
                    <div className="text-brand-dark/45 text-[9px] sm:text-sm font-inter">{r.detail}</div>
                  </div>
                </div>
                <p className="mt-2 text-brand-purple/60 text-[9px] font-inter sm:hidden">Tap to read</p>
              </motion.div>
            );
          })}
        </div>

        {/* Expanded modal */}
        <AnimatePresence>
          {active && activeStyle && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm" />

              {/* Card */}
              <motion.div
                className="relative w-full max-w-sm rounded-3xl p-7 shadow-2xl"
                style={{
                  background: "rgba(255,250,235,0.98)",
                  border:     `1px solid ${activeStyle.border}`,
                }}
                initial={{ opacity: 0, scale: 0.88, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 24 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-brand-dark/8 hover:bg-brand-dark/15 flex items-center justify-center transition-colors"
                >
                  <X size={14} className="text-brand-dark/60" />
                </button>

                <div className="text-brand-purple font-playfair text-5xl leading-none mb-4 select-none">&ldquo;</div>
                <p className="text-brand-dark/80 leading-relaxed text-base font-inter mb-6">{active.text}</p>

                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-brand-dark shrink-0"
                    style={{ background: activeStyle.bg }}
                  >
                    {active.name[0]}
                  </div>
                  <div>
                    <div className="font-inter font-semibold text-brand-dark text-base">{active.name}</div>
                    <div className="text-brand-dark/45 text-sm font-inter">{active.detail}</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl p-4 sm:p-6 text-center"
          style={{ background: "rgba(255,255,255,0.55)", border: "1px dashed rgba(37,211,102,0.45)" }}
        >
          <p className="text-brand-dark/55 text-xs sm:text-sm font-inter mb-3">
            Bought a kit? We&apos;d love to hear how your child got on.
          </p>
          <a
            href={whatsappGeneralLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#25D366] hover:text-[#20bd5a] font-semibold text-xs sm:text-sm font-inter transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Share your experience on WhatsApp →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
