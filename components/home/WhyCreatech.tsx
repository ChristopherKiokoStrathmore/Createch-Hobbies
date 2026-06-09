"use client";

import { motion } from "framer-motion";
import { GraduationCap, Users, BarChart2, Tag, Package, Gift } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";

const ICON = "w-5 h-5 sm:w-10 sm:h-10 text-brand-purple";
const SW   = 1.5;

const ITEM_ICONS = [
  <GraduationCap key="0" className={ICON} strokeWidth={SW} />,
  <Users         key="1" className={ICON} strokeWidth={SW} />,
  <BarChart2     key="2" className={ICON} strokeWidth={SW} />,
  <Tag           key="3" className={ICON} strokeWidth={SW} />,
  <Package       key="4" className={ICON} strokeWidth={SW} />,
  <Gift          key="5" className={ICON} strokeWidth={SW} />,
];

export default function WhyCreatech() {
  const { whyCreatech } = useSiteConfig();
  const words      = whyCreatech.sectionTitle.split(" ");
  const titleStart = words.slice(0, -1).join(" ");
  const titleEnd   = words.slice(-1)[0];

  return (
    <section className="section-base py-8 sm:py-28 px-4 sm:px-6" data-editor-key="whyCreatech">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-14"
        >
          <span className="text-brand-purple-light font-inter font-semibold text-xs uppercase tracking-[0.2em]">
            {whyCreatech.sectionLabel}
          </span>
          <h2 className="font-playfair font-bold text-xl sm:text-4xl md:text-5xl text-white mt-3 sm:mt-4">
            {titleStart}{" "}
            <em className="text-gradient not-italic">{titleEnd}</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {whyCreatech.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="section-card rounded-2xl p-3 sm:p-7 border border-white/5 hover:border-brand-purple/20 transition-all duration-300 group card-glow"
            >
              <div className="mb-2 sm:mb-5">{ITEM_ICONS[i]}</div>
              <h3 className="font-playfair font-bold text-white text-xs sm:text-lg mb-1 sm:mb-3">{item.title}</h3>
              <p className="hidden sm:block text-white/45 text-sm leading-relaxed font-inter">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
