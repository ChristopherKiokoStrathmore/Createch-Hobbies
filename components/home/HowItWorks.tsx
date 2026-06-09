"use client";

import { motion } from "framer-motion";
import { useSiteConfig } from "@/context/SiteConfigContext";

function ShoppingBagIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="w-6 h-6 sm:w-12 sm:h-12 text-brand-purple">
      <path d="M4 8 L20 8 L21.5 20 C21.5 20.6 21 21 20.5 21 L3.5 21 C3 21 2.5 20.6 2.5 20 Z" />
      <line x1="4" y1="11" x2="20" y2="11" />
      <path d="M9 8 C9 8 9 4 12 4 C15 4 15 8 15 8" />
    </svg>
  );
}

function DeliveryTruckIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="w-6 h-6 sm:w-12 sm:h-12 text-brand-purple">
      <rect x="1" y="7" width="13" height="9" rx="0.5" />
      <path d="M14 7 L14 5 L18 5 L21 8 L21 16 L14 16" />
      <line x1="14" y1="8" x2="21" y2="8" />
      <line x1="9" y1="7" x2="9" y2="16" />
      <circle cx="5" cy="16" r="2.2" /><circle cx="5" cy="16" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="16" r="2.2" /><circle cx="17.5" cy="16" r="0.7" fill="currentColor" stroke="none" />
      <line x1="20" y1="10.5" x2="21" y2="10.5" /><line x1="20" y1="12" x2="21" y2="12" />
    </svg>
  );
}

function BuildFunIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="w-6 h-6 sm:w-12 sm:h-12 text-brand-purple">
      <polygon points="12,3 14.23,8.93 20.56,9.22 15.61,13.17 17.29,19.28 12,15.8 6.71,19.28 8.39,13.17 3.44,9.22 9.77,8.93" />
      <circle cx="10.3" cy="11" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="13.7" cy="11" r="0.6" fill="currentColor" stroke="none" />
      <path d="M10 12.8 Q12 14.6 14 12.8" />
      <path d="M20,2.5 L20.5,3.5 L21.5,4 L20.5,4.5 L20,5.5 L19.5,4.5 L18.5,4 L19.5,3.5 Z" strokeWidth="1" />
      <path d="M4,18.8 L4.4,19.7 L5.3,20 L4.4,20.3 L4,21.2 L3.6,20.3 L2.7,20 L3.6,19.7 Z" strokeWidth="1" />
    </svg>
  );
}

const stepIcons = [ShoppingBagIcon, DeliveryTruckIcon, BuildFunIcon];

export default function HowItWorks() {
  const { howItWorks } = useSiteConfig();

  return (
    <section className="section-alt py-14 sm:py-28 px-4 sm:px-6" data-editor-key="howItWorks">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-18"
        >
          <span className="text-brand-purple-light font-inter font-semibold text-xs uppercase tracking-[0.2em]">
            {howItWorks.sectionLabel}
          </span>
          <h2 className="font-playfair font-bold text-xl sm:text-4xl md:text-5xl text-white mt-3 sm:mt-4">
            {howItWorks.sectionTitle.split(" ").slice(0, -1).join(" ")}{" "}
            <em className="text-gradient not-italic">
              {howItWorks.sectionTitle.split(" ").slice(-1)[0]}
            </em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-3 gap-2 sm:gap-6 mt-4 sm:mt-14">
          {howItWorks.steps.map((step, i) => {
            const Icon = stepIcons[i] ?? BuildFunIcon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.15 }}
                className="relative group flex flex-col"
              >
                {i < howItWorks.steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-brand-purple/30 to-transparent z-0" />
                )}
                <div className="section-card rounded-xl p-2 sm:p-8 border border-brand-dark/10 hover:border-brand-purple/25 transition-all duration-300 card-glow relative z-10 h-full flex flex-col" data-editor-key="howItWorks.steps">
                  <div className="mb-1 sm:mb-5"><Icon /></div>
                  <div className="text-brand-purple font-playfair font-bold text-[9px] sm:text-sm mb-1 sm:mb-2 tracking-widest uppercase">
                    Step {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="font-playfair font-bold text-xs sm:text-xl text-white mb-1 sm:mb-3">
                    {step.title}
                  </h3>
                  <p className="hidden sm:block text-white/45 leading-relaxed text-sm font-inter">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
