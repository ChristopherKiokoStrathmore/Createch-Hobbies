"use client";

import type { SiteConfig } from "@/types/site-config";

const HEADING_FONTS = [
  "Playfair Display",
  "Cormorant Garamond",
  "Libre Baskerville",
  "Merriweather",
  "Lora",
  "DM Serif Display",
  "Fraunces",
  "Josefin Sans",
  "Raleway",
];

const BODY_FONTS = [
  "Inter",
  "DM Sans",
  "Nunito",
  "Outfit",
  "Plus Jakarta Sans",
  "Sora",
  "Poppins",
  "Work Sans",
  "Manrope",
];

interface Props {
  config: SiteConfig;
  onChange: (patch: Partial<SiteConfig> | ((prev: SiteConfig) => SiteConfig)) => void;
}

function FontSelect({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
}) {
  return (
    <div className="mb-5">
      <p className="text-white/65 font-inter text-[10px] uppercase tracking-widest mb-2">{label}</p>
      <div className="space-y-0.5">
        {options.map(font => (
          <button
            key={font}
            onClick={() => onSelect(font)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
              value === font
                ? "bg-white/10 text-white"
                : "text-white/45 hover:text-white/70 hover:bg-white/5"
            }`}
            style={{ fontFamily: `'${font}', sans-serif` }}
          >
            {font}
            {value === font && <span className="ml-2 text-[10px] text-brand-yellow">active</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TypographyPanel({ config, onChange }: Props) {
  return (
    <div>
      <FontSelect
        label="Heading font"
        value={config.typography.headingFont}
        options={HEADING_FONTS}
        onSelect={v => onChange(prev => ({ ...prev, typography: { ...prev.typography, headingFont: v } }))}
      />
      <FontSelect
        label="Body font"
        value={config.typography.bodyFont}
        options={BODY_FONTS}
        onSelect={v => onChange(prev => ({ ...prev, typography: { ...prev.typography, bodyFont: v } }))}
      />
    </div>
  );
}
