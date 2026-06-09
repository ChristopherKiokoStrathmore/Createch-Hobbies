"use client";

import type { SiteConfig, ShadowLevel } from "@/types/site-config";

interface Props {
  config: SiteConfig;
  onChange: (patch: Partial<SiteConfig> | ((prev: SiteConfig) => SiteConfig)) => void;
}

const SHADOW_LEVELS: { value: ShadowLevel; label: string; preview: string }[] = [
  { value: "none",   label: "None",   preview: "0 0 0 0 transparent" },
  { value: "soft",   label: "Subtle", preview: "0 2px 8px rgba(0,0,0,0.25)" },
  { value: "medium", label: "Medium", preview: "0 4px 20px rgba(0,0,0,0.4)" },
  { value: "strong", label: "Strong", preview: "0 8px 40px rgba(0,0,0,0.6)" },
];

export default function ComponentStylePanel({ config, onChange }: Props) {
  const cs = config.cardStyle;

  const set = (key: keyof SiteConfig["cardStyle"]) => (val: string | number) =>
    onChange(prev => ({ ...prev, cardStyle: { ...prev.cardStyle, [key]: val } }));

  return (
    <div className="space-y-6">
      {/* Border radius */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-white/70 font-inter text-[10px] uppercase tracking-widest">Border radius</label>
          <span className="text-white/60 font-mono text-[10px]">{cs.borderRadius}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={32}
          step={2}
          value={cs.borderRadius}
          onChange={e => set("borderRadius")(Number(e.target.value))}
          className="w-full accent-brand-yellow"
        />
        <div className="flex justify-between text-white/20 font-inter text-[9px] mt-1">
          <span>Sharp</span><span>Rounded</span>
        </div>
      </div>

      {/* Shadow */}
      <div>
        <label className="text-white/70 font-inter text-[10px] uppercase tracking-widest block mb-3">Shadow</label>
        <div className="grid grid-cols-1 gap-2">
          {SHADOW_LEVELS.map(s => (
            <button
              key={s.value}
              onClick={() => set("shadowLevel")(s.value)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                cs.shadowLevel === s.value
                  ? "border-white/20 bg-white/8 text-white"
                  : "border-white/5 text-white/40 hover:border-white/10 hover:text-white/60"
              }`}
            >
              <div
                className="w-8 h-8 rounded-md bg-white/10 shrink-0"
                style={{ boxShadow: s.preview }}
              />
              <span className="font-inter text-xs">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Card colours */}
      <div>
        <label className="text-white/70 font-inter text-[10px] uppercase tracking-widest block mb-3">Card colours</label>

        <div className="divide-y divide-white/5">
          {(["bgColor", "borderColor"] as const).map(key => (
            <div key={key} className="flex items-center justify-between py-2.5">
              <span className="text-white/60 font-inter text-xs">
                {key === "bgColor" ? "Background" : "Border"}
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="font-mono text-[10px] text-white/60">{cs[key]}</span>
                <div className="relative">
                  <div
                    className="w-7 h-7 rounded-md border border-white/15"
                    style={{ background: cs[key] }}
                  />
                  <input
                    type="color"
                    value={cs[key].startsWith("rgba") ? "#ffffff" : cs[key]}
                    onChange={e => set(key)(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Live preview */}
      <div>
        <label className="text-white/70 font-inter text-[10px] uppercase tracking-widest block mb-3">Preview</label>
        <div
          className="p-4"
          style={{
            background: cs.bgColor,
            borderRadius: `${cs.borderRadius}px`,
            border: `1px solid ${cs.borderColor}`,
            boxShadow: SHADOW_LEVELS.find(s => s.value === cs.shadowLevel)?.preview,
          }}
        >
          <div className="w-8 h-8 rounded-full bg-white/10 mb-3" />
          <div className="h-2 bg-white/10 rounded w-3/4 mb-2" />
          <div className="h-2 bg-white/5 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}
