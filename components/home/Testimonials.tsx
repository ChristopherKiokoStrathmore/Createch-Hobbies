"use client";

import { motion } from "framer-motion";
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
  const words      = testimonials.sectionTitle.split(" ");
  const titleStart = words.slice(0, -2).join(" ");
  const titleEnd   = words.slice(-2).join(" ");

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
                className="rounded-2xl p-3 sm:p-7 flex flex-col h-full"
                style={{
                  background:  "rgba(255,246,220,0.70)",
                  border:      `1px solid ${style.border}`,
                  boxShadow:   "0 2px 24px rgba(10,10,15,0.06)",
                }}
              >
                <div className="text-brand-purple font-playfair text-2xl sm:text-5xl leading-none mb-1 sm:mb-3 select-none">&ldquo;</div>
                <p className="text-brand-dark/70 leading-relaxed text-[10px] sm:text-base font-inter mb-3 sm:mb-6 flex-1">{r.text}</p>
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
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl p-6 text-center"
          style={{ background: "rgba(255,255,255,0.55)", border: "1px dashed rgba(37,211,102,0.45)" }}
        >
          <p className="text-brand-dark/55 text-sm font-inter mb-3">
            Bought a kit? We&apos;d love to hear how your child got on.
          </p>
          <a
            href={whatsappGeneralLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#25D366] hover:text-[#20bd5a] font-semibold text-sm font-inter transition-colors"
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
