"use client";

import type { SiteConfig } from "@/types/site-config";

const PRESETS = [
  { label: "Default",   yellow: "#f5be4d", purple: "#754398", dark: "#0a0a0f" },
  { label: "Ocean",     yellow: "#38bdf8", purple: "#6366f1", dark: "#0f172a" },
  { label: "Forest",    yellow: "#4ade80", purple: "#7c3aed", dark: "#0d1a0d" },
  { label: "Sunset",    yellow: "#fb923c", purple: "#ec4899", dark: "#1a0a0a" },
  { label: "Monochrome",yellow: "#e5e7eb", purple: "#6b7280", dark: "#111827" },
];

interface Props {
  config: SiteConfig;
  onChange: (patch: Partial<SiteConfig> | ((prev: SiteConfig) => SiteConfig)) => void;
}

function Swatch({ label, value, onPick }: { label: string; value: string; onPick: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <label className="text-white/60 font-inter text-xs">{label}</label>
      <div className="flex items-center gap-2">
        <span className="text-white/60 font-mono text-[10px]">{value}</span>
        <label className="relative cursor-pointer">
          <div
            className="w-7 h-7 rounded-md border border-white/15 cursor-pointer"
            style={{ background: value }}
          />
          <input
            type="color"
            value={value}
            onChange={e => onPick(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </label>
      </div>
    </div>
  );
}

export default function ColourPanel({ config, onChange }: Props) {
  const set = (key: keyof SiteConfig["tokens"]) => (val: string) =>
    onChange(prev => ({ ...prev, tokens: { ...prev.tokens, [key]: val } }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-white/60 font-inter text-[10px] uppercase tracking-widest mb-1">Brand tokens</p>
        <div className="divide-y divide-white/5">
          <Swatch label="Accent (Yellow)" value={config.tokens.yellow} onPick={set("yellow")} />
          <Swatch label="Highlight (Purple)" value={config.tokens.purple} onPick={set("purple")} />
          <Swatch label="Background (Dark)" value={config.tokens.dark} onPick={set("dark")} />
        </div>
      </div>

      <div>
        <p className="text-white/60 font-inter text-[10px] uppercase tracking-widest mb-3">Presets</p>
        <div className="grid grid-cols-1 gap-1.5">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => onChange(prev => ({ ...prev, tokens: { yellow: p.yellow, purple: p.purple, dark: p.dark } }))}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex gap-1 shrink-0">
                {[p.yellow, p.purple, p.dark].map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded-full border border-white/10" style={{ background: c }} />
                ))}
              </div>
              <span className="text-white/55 font-inter text-xs">{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
