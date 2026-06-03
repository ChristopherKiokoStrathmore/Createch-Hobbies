"use client";

import { motion } from "framer-motion";

function ShoppingBagIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-12 h-12 text-brand-purple"
    >
      {/*
        Shopping bag body: trapezoid wider at bottom than top.
        Top opening spans roughly x=4 to x=20 (seam line).
        Body goes down from x=3,y=8 to x=21,y=8 then expands:
        bottom corners at x=2,y=21 and x=22,y=21.
        Curved handle arc sits above the opening.
      */}
      {/* Bag body */}
      <path d="M4 8 L20 8 L21.5 20 C21.5 20.6 21 21 20.5 21 L3.5 21 C3 21 2.5 20.6 2.5 20 Z" />
      {/* Seam / opening line */}
      <line x1="4" y1="11" x2="20" y2="11" />
      {/* Left handle arc */}
      <path d="M9 8 C9 8 9 4 12 4 C15 4 15 8 15 8" />
    </svg>
  );
}

function DeliveryTruckIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-12 h-12 text-brand-purple"
    >
      {/* Cargo box body */}
      <rect x="1" y="7" width="13" height="9" rx="0.5" />
      {/* Cab: step up from x=14 at cargo roof level, then out to windshield, angled down to grille */}
      <path d="M14 7 L14 5 L18 5 L21 8 L21 16 L14 16" />
      {/* Windshield horizontal ledge */}
      <line x1="14" y1="8" x2="21" y2="8" />
      {/* Cargo door seam */}
      <line x1="9" y1="7" x2="9" y2="16" />
      {/* Rear wheel — filled centre rings to look like wheels */}
      <circle cx="5" cy="16" r="2.2" />
      <circle cx="5" cy="16" r="0.7" fill="currentColor" stroke="none" />
      {/* Front wheel */}
      <circle cx="17.5" cy="16" r="2.2" />
      <circle cx="17.5" cy="16" r="0.7" fill="currentColor" stroke="none" />
      {/* Small front grille detail */}
      <line x1="20" y1="10.5" x2="21" y2="10.5" />
      <line x1="20" y1="12" x2="21" y2="12" />
    </svg>
  );
}

function WrenchScrewdriverIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-12 h-12 text-brand-purple"
    >
      {/*
        Crossed tools forming an X:
        - Wrench: runs top-left (3,3) to bottom-right (21,21)
          Head at top-left: open C-shaped jaw
          Tail at bottom-right: handle end
        - Screwdriver: runs top-right (21,3) to bottom-left (3,21)
          Tip at bottom-left: flat-head blade
          Handle at top-right: chunky grip rectangle
      */}

      {/* ── WRENCH (top-left → bottom-right diagonal) ── */}
      {/* Shaft */}
      <line x1="6.5" y1="6.5" x2="17.5" y2="17.5" />
      {/* Head: open jaw at top-left, two prongs */}
      <path d="M3 6 C3 4.3 4.3 3 6 3 C7.7 3 9 4.3 9 6 L7.5 7.5 L6 6 L4.5 7.5 Z" />
      {/* Handle nub at bottom-right */}
      <path d="M17.5 17.5 L19 19 C19.8 19.8 19.8 21 19 21.8 C18.2 22.6 17 22.6 16.2 21.8 L15 20.5 Z" />

      {/* ── SCREWDRIVER (top-right → bottom-left diagonal) ── */}
      {/* Shaft */}
      <line x1="17.5" y1="6.5" x2="6.5" y2="17.5" />
      {/* Handle at top-right: rounded rectangle grip */}
      <rect x="17" y="2" width="5" height="7" rx="1.5" transform="rotate(45 19.5 5.5)" />
      {/* Flat-head blade tip at bottom-left */}
      <line x1="3.5" y1="19" x2="5" y2="20.5" />
      <line x1="3.5" y1="20.5" x2="5" y2="19" />
    </svg>
  );
}

const steps = [
  {
    icon: <ShoppingBagIcon />,
    step: "01",
    title: "Choose Your Kit",
    description:
      "Browse 17 DIY kit types: vehicles, robots, science experiments, and more. Use filters to find the right kit by age or difficulty.",
  },
  {
    icon: <DeliveryTruckIcon />,
    step: "02",
    title: "We Deliver to You",
    description:
      "Order via WhatsApp and we deliver to your door across Nairobi in 1–2 business days. We'll confirm delivery charges and timing when you message us.",
  },
  {
    icon: <WrenchScrewdriverIcon />,
    step: "03",
    title: "Build & Have Fun!",
    description:
      "Follow the step-by-step instructions and assemble your kit. No glue, no mess. Just pure building joy.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section-alt py-14 sm:py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-18"
        >
          <span className="text-brand-purple-light font-inter font-semibold text-xs uppercase tracking-[0.2em]">
            How It Works
          </span>
          <h2 className="font-playfair font-bold text-3xl sm:text-4xl md:text-5xl text-white mt-4">
            Three Steps to{" "}
            <em className="text-gradient not-italic">Building Fun</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.15 }}
              className="relative group flex flex-col"
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-brand-purple/30 to-transparent z-0" />
              )}
              <div className="section-card rounded-2xl p-5 sm:p-8 border border-brand-dark/10 hover:border-brand-purple/25 transition-all duration-300 card-glow relative z-10 h-full flex flex-col">
                <div className="mb-5">{step.icon}</div>
                <div className="text-brand-purple font-playfair font-bold text-sm mb-2 tracking-widest uppercase">
                  Step {step.step}
                </div>
                <h3 className="font-playfair font-bold text-xl text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/45 leading-relaxed text-sm font-inter">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
