"use client";

import type { SiteConfig } from "@/types/site-config";

interface Props {
  config: SiteConfig;
  onChange: (patch: Partial<SiteConfig> | ((prev: SiteConfig) => SiteConfig)) => void;
}

function Field({
  label,
  value,
  onChange,
  max,
  multiline,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max?: number;
  multiline?: boolean;
  hint?: string;
}) {
  const over = max ? value.length > max : false;

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-white/75 font-inter text-[11px] uppercase tracking-widest">{label}</label>
        {max && (
          <span className={`font-mono text-[10px] ${over ? "text-red-400" : "text-white/55"}`}>
            {value.length}/{max}
          </span>
        )}
      </div>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-inter resize-none focus:outline-none focus:border-white/25 transition-colors"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-inter focus:outline-none focus:border-white/25 transition-colors"
        />
      )}
      {hint && <p className="text-white/55 font-inter text-[10px] mt-1">{hint}</p>}
    </div>
  );
}

export default function SeoPanel({ config, onChange }: Props) {
  const set = (key: keyof SiteConfig["seo"]) => (val: string) =>
    onChange(prev => ({ ...prev, seo: { ...prev.seo, [key]: val } }));

  return (
    <div>
      <p className="text-white/55 font-inter text-[10px] mb-5">
        These fields update live on publish. Changes appear in search engines after the next crawl.
      </p>

      <Field label="Page title" value={config.seo.title} onChange={set("title")} max={60} hint="Shown in browser tab and search results" />
      <Field label="Meta description" value={config.seo.description} onChange={set("description")} max={160} multiline hint="Shown under the title in search results" />

      <div className="h-px bg-white/5 my-5" />
      <p className="text-white/60 font-inter text-[10px] uppercase tracking-widest mb-4">Open Graph (social)</p>

      <Field label="OG title" value={config.seo.ogTitle} onChange={set("ogTitle")} max={60} />
      <Field label="OG description" value={config.seo.ogDescription} onChange={set("ogDescription")} max={200} multiline />
      <Field label="OG image URL" value={config.seo.ogImage} onChange={set("ogImage")} hint="1200×630px recommended" />
    </div>
  );
}
