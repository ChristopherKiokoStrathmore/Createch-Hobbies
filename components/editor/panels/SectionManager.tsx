"use client";

import { GripVertical, Eye, EyeOff } from "lucide-react";
import type { SiteConfig, SiteSection } from "@/types/site-config";

interface Props {
  config: SiteConfig;
  onChange: (patch: Partial<SiteConfig> | ((prev: SiteConfig) => SiteConfig)) => void;
}

const SECTION_LABELS: Record<string, string> = {
  hero:          "Hero (Video + CTA)",
  howItWorks:    "How It Works",
  featuredKits:  "Featured Kits",
  categories:    "Category Grid",
  ageGroups:     "Age Groups",
  whyCreatech:   "Why Createch",
  testimonials:  "Testimonials",
  newsletter:    "Newsletter",
  workshops:     "Workshops & Events",
};

export default function SectionManager({ config, onChange }: Props) {
  const sections = config.sections;

  const toggle = (id: string) => {
    onChange(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === id ? { ...s, visible: !s.visible } : s
      ),
    }));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= sections.length) return;
    onChange(prev => {
      const next = [...prev.sections];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return { ...prev, sections: next };
    });
  };

  return (
    <div>
      <p className="text-white/55 font-inter text-[10px] mb-4">
        Toggle visibility and drag to reorder sections. Hero cannot be hidden.
      </p>

      <div className="space-y-1.5">
        {sections.map((section: SiteSection, idx: number) => {
          const label = SECTION_LABELS[section.id] ?? section.id;
          const isHero = section.id === "hero";

          return (
            <div
              key={section.id}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${
                section.visible
                  ? "bg-white/5 border-white/8"
                  : "bg-transparent border-white/4 opacity-50"
              }`}
            >
              {/* Drag handle */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => move(idx, idx - 1)}
                  disabled={idx === 0}
                  className="text-white/20 hover:text-white/50 disabled:opacity-10 transition-colors text-[8px] leading-none"
                >
                  ▲
                </button>
                <GripVertical size={12} className="text-white/15 mx-auto" />
                <button
                  onClick={() => move(idx, idx + 1)}
                  disabled={idx === sections.length - 1}
                  className="text-white/20 hover:text-white/50 disabled:opacity-10 transition-colors text-[8px] leading-none"
                >
                  ▼
                </button>
              </div>

              <span className="flex-1 text-white/65 font-inter text-xs">{label}</span>

              <button
                onClick={() => !isHero && toggle(section.id)}
                disabled={isHero}
                className={`p-1 rounded transition-colors ${
                  isHero
                    ? "text-white/15 cursor-not-allowed"
                    : section.visible
                    ? "text-white/50 hover:text-white"
                    : "text-white/20 hover:text-white/40"
                }`}
                title={isHero ? "Hero cannot be hidden" : section.visible ? "Hide section" : "Show section"}
              >
                {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
