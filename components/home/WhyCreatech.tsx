"use client";

import { motion } from "framer-motion";

const reasons = [
  {
    emoji: "🎓",
    title: "STEM Learning in Disguise",
    description:
      "Every kit teaches real engineering, physics, or science principles — wrapped in pure, irresistible fun that kids love.",
    color: "brand-yellow",
  },
  {
    emoji: "🔩",
    title: "No Glue. No Mess.",
    description:
      "All kits use snap-fit assembly. Parents love it, kids love it. Just open the box and start building.",
    color: "brand-purple",
  },
  {
    emoji: "📊",
    title: "Age-Appropriate Challenges",
    description:
      "Kits rated Beginner to Advanced for ages 5–14. Always just challenging enough to feel like a real achievement.",
    color: "brand-yellow",
  },
  {
    emoji: "💸",
    title: "Affordable STEM",
    description:
      "Starting from just KES 850. Quality STEM education shouldn't require a big budget.",
    color: "brand-purple",
  },
  {
    emoji: "📦",
    title: "Everything Included",
    description:
      "Each kit comes with all parts, instructions, and a guide explaining the science behind what you built.",
    color: "brand-yellow",
  },
  {
    emoji: "🎁",
    title: "The Gift They'll Remember",
    description:
      "Forget toys that break in a day. These kits are built, displayed, and played with for months.",
    color: "brand-purple",
  },
];

export default function WhyCreatech() {
  return (
    <section className="section-base py-14 sm:py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-14"
        >
          <span className="text-brand-purple-light font-inter font-semibold text-xs uppercase tracking-[0.2em]">
            Why Choose Us
          </span>
          <h2 className="font-playfair font-bold text-3xl sm:text-4xl md:text-5xl text-white mt-4">
            Why Parents{" "}
            <em className="text-gradient not-italic">Love Createch</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="section-card rounded-2xl p-5 sm:p-7 border border-white/5 hover:border-brand-yellow/15 transition-all duration-300 group card-glow"
            >
              <div className="text-4xl mb-5">{reason.emoji}</div>
              <h3 className="font-playfair font-bold text-white text-lg mb-3">
                {reason.title}
              </h3>
              <p className="text-white/45 text-sm leading-relaxed font-inter">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
