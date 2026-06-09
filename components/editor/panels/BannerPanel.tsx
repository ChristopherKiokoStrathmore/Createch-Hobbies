"use client";

import type { SiteConfig } from "@/types/site-config";

interface Props {
  config: SiteConfig;
  onChange: (patch: Partial<SiteConfig> | ((prev: SiteConfig) => SiteConfig)) => void;
}

export default function BannerPanel({ config, onChange }: Props) {
  const b = config.banner;
  const set = (key: keyof SiteConfig["banner"]) => (val: string | boolean) =>
    onChange(prev => ({ ...prev, banner: { ...prev.banner, [key]: val } }));

  return (
    <div className="space-y-5">
      {/* Enable toggle */}
      <div className="flex items-center justify-between py-2 border-b border-white/10">
        <div>
          <p className="text-white font-inter text-sm">Show banner</p>
          <p className="text-white/55 font-inter text-[10px]">Displays above the navigation bar</p>
        </div>
        <button
          onClick={() => set("enabled")(!b.enabled)}
          className={`relative w-10 h-5.5 rounded-full transition-colors ${b.enabled ? "bg-brand-yellow" : "bg-white/15"}`}
          style={{ minWidth: "40px", height: "22px" }}
        >
          <span
            className="absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform"
            style={{
              width: "18px",
              height: "18px",
              transform: b.enabled ? "translateX(18px)" : "translateX(0)",
            }}
          />
        </button>
      </div>

      {b.enabled && (
        <>
          <div>
            <label className="text-white/70 font-inter text-[10px] uppercase tracking-widest block mb-1.5">Banner text</label>
            <input
              type="text"
              value={b.text}
              onChange={e => set("text")(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-inter focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-white/70 font-inter text-[10px] uppercase tracking-widest block mb-1.5">Background</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="w-7 h-7 rounded-md border border-white/15" style={{ background: b.bgColor }} />
                <input
                  type="color"
                  value={b.bgColor}
                  onChange={e => set("bgColor")(e.target.value)}
                  className="sr-only"
                />
                <span className="font-mono text-[10px] text-white/65">{b.bgColor}</span>
              </label>
            </div>
            <div className="flex-1">
              <label className="text-white/70 font-inter text-[10px] uppercase tracking-widest block mb-1.5">Text colour</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="w-7 h-7 rounded-md border border-white/15" style={{ background: b.textColor }} />
                <input
                  type="color"
                  value={b.textColor}
                  onChange={e => set("textColor")(e.target.value)}
                  className="sr-only"
                />
                <span className="font-mono text-[10px] text-white/65">{b.textColor}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-white/70 font-inter text-[10px] uppercase tracking-widest block mb-1.5">Link URL (optional)</label>
            <input
              type="text"
              value={b.link}
              placeholder="/shop"
              onChange={e => set("link")(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-inter focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>

          <div>
            <label className="text-white/70 font-inter text-[10px] uppercase tracking-widest block mb-1.5">Link label</label>
            <input
              type="text"
              value={b.linkLabel}
              placeholder="Shop now"
              onChange={e => set("linkLabel")(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-inter focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between py-1.5">
            <p className="text-white font-inter text-xs">Dismissible by visitor</p>
            <button
              onClick={() => set("dismissible")(!b.dismissible)}
              className="relative rounded-full transition-colors"
              style={{ minWidth: "40px", height: "22px", background: b.dismissible ? "rgb(245 190 77 / 0.8)" : "rgb(255 255 255 / 0.15)" }}
            >
              <span
                className="absolute top-0.5 left-0.5 rounded-full bg-white shadow transition-transform"
                style={{
                  width: "18px",
                  height: "18px",
                  transform: b.dismissible ? "translateX(18px)" : "translateX(0)",
                }}
              />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
