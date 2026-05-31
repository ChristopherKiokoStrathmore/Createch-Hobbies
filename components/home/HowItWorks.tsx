"use client";

import { motion } from "framer-motion";

const steps = [
  {
    icon: "🛒",
    step: "01",
    title: "Choose Your Kit",
    description:
      "Browse 17 DIY kit types — vehicles, robots, science experiments, and more. Use filters to find the right kit by age or difficulty.",
  },
  {
    icon: "🚚",
    step: "02",
    title: "We Deliver to You",
    description:
      "Order via WhatsApp and we deliver to your door across Nairobi in 1–2 business days. We'll confirm delivery charges and timing when you message us.",
  },
  {
    icon: "🔧",
    step: "03",
    title: "Build & Have Fun!",
    description:
      "Follow the step-by-step instructions and assemble your kit. No glue, no mess — just pure building joy.",
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
              className="relative group"
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-brand-purple/30 to-transparent z-0" />
              )}
              <div className="section-card rounded-2xl p-5 sm:p-8 border border-brand-yellow/8 hover:border-brand-yellow/20 transition-all duration-300 card-glow relative z-10">
                <div className="text-5xl mb-5">{step.icon}</div>
                <div className="text-brand-yellow font-playfair font-bold text-sm mb-2 tracking-widest uppercase">
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
