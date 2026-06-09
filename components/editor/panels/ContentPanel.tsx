"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { SiteConfig } from "@/types/site-config";

interface Props {
  config: SiteConfig;
  onChange: (patch: Partial<SiteConfig> | ((prev: SiteConfig) => SiteConfig)) => void;
  focusTab?: string;
}

type Section = "hero" | "howitworks" | "nav" | "whatsapp" | "footer" | "trustbar" | "whycreatech" | "testimonials" | "wacta";

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="mb-4">
      <label className="text-white/70 font-inter text-[10px] uppercase tracking-widest block mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={2}
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
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md font-inter text-[10px] transition-all whitespace-nowrap ${
        active ? "bg-white/10 text-white" : "text-white/35 hover:text-white/60"
      }`}
    >
      {children}
    </button>
  );
}

export default function ContentPanel({ config, onChange, focusTab }: Props) {
  const [section, setSection] = useState<Section>("hero");

  // Jump to the right tab when click-to-inspect fires
  useEffect(() => {
    if (focusTab && (["hero","howitworks","nav","whatsapp","footer","trustbar","whycreatech","testimonials","wacta"] as string[]).includes(focusTab)) {
      setSection(focusTab as Section);
    }
  }, [focusTab]);

  return (
    <div>
      {/* Section tabs */}
      <div className="flex flex-wrap gap-1 mb-5 pb-3 border-b border-white/5">
        <TabBtn active={section === "hero"}         onClick={() => setSection("hero")}>Hero</TabBtn>
        <TabBtn active={section === "howitworks"}   onClick={() => setSection("howitworks")}>Steps</TabBtn>
        <TabBtn active={section === "trustbar"}     onClick={() => setSection("trustbar")}>Trust</TabBtn>
        <TabBtn active={section === "whycreatech"}  onClick={() => setSection("whycreatech")}>Why Us</TabBtn>
        <TabBtn active={section === "testimonials"} onClick={() => setSection("testimonials")}>Reviews</TabBtn>
        <TabBtn active={section === "wacta"}        onClick={() => setSection("wacta")}>WA CTA</TabBtn>
        <TabBtn active={section === "nav"}          onClick={() => setSection("nav")}>Nav</TabBtn>
        <TabBtn active={section === "whatsapp"}     onClick={() => setSection("whatsapp")}>WhatsApp</TabBtn>
        <TabBtn active={section === "footer"}       onClick={() => setSection("footer")}>Footer</TabBtn>
      </div>

      {/* Hero */}
      {section === "hero" && (
        <div>
          <Field
            label="Headline"
            value={config.hero.headline}
            onChange={v => onChange(prev => ({ ...prev, hero: { ...prev.hero, headline: v } }))}
          />
          <Field
            label="Subheadline"
            value={config.hero.subheadline}
            onChange={v => onChange(prev => ({ ...prev, hero: { ...prev.hero, subheadline: v } }))}
            multiline
          />
          <div className="h-px bg-white/5 my-4" />
          <Field
            label="Primary CTA label"
            value={config.hero.ctaPrimaryLabel}
            onChange={v => onChange(prev => ({ ...prev, hero: { ...prev.hero, ctaPrimaryLabel: v } }))}
          />
          <Field
            label="Primary CTA link"
            value={config.hero.ctaPrimaryHref}
            onChange={v => onChange(prev => ({ ...prev, hero: { ...prev.hero, ctaPrimaryHref: v } }))}
          />
          <Field
            label="Secondary CTA label"
            value={config.hero.ctaSecondaryLabel}
            onChange={v => onChange(prev => ({ ...prev, hero: { ...prev.hero, ctaSecondaryLabel: v } }))}
          />
          <Field
            label="Secondary CTA link"
            value={config.hero.ctaSecondaryHref}
            onChange={v => onChange(prev => ({ ...prev, hero: { ...prev.hero, ctaSecondaryHref: v } }))}
          />
        </div>
      )}

      {/* How It Works steps */}
      {section === "howitworks" && (
        <div>
          <Field
            label="Section label"
            value={config.howItWorks.sectionLabel}
            onChange={v => onChange(prev => ({ ...prev, howItWorks: { ...prev.howItWorks, sectionLabel: v } }))}
          />
          <Field
            label="Section title"
            value={config.howItWorks.sectionTitle}
            onChange={v => onChange(prev => ({ ...prev, howItWorks: { ...prev.howItWorks, sectionTitle: v } }))}
          />
          <div className="h-px bg-white/5 my-4" />
          {config.howItWorks.steps.map((step, i) => (
            <div key={i} className="mb-5 pb-5 border-b border-white/5 last:border-0">
              <p className="text-white/60 font-inter text-[10px] uppercase tracking-widest mb-3">Step {i + 1}</p>
              <Field
                label="Title"
                value={step.title}
                onChange={v => onChange(prev => ({
                  ...prev,
                  howItWorks: {
                    ...prev.howItWorks,
                    steps: prev.howItWorks.steps.map((s, j) => j === i ? { ...s, title: v } : s),
                  },
                }))}
              />
              <Field
                label="Description"
                value={step.description}
                onChange={v => onChange(prev => ({
                  ...prev,
                  howItWorks: {
                    ...prev.howItWorks,
                    steps: prev.howItWorks.steps.map((s, j) => j === i ? { ...s, description: v } : s),
                  },
                }))}
                multiline
              />
            </div>
          ))}
        </div>
      )}

      {/* Nav links */}
      {section === "nav" && (
        <div>
          <div className="space-y-2 mb-4">
            {config.nav.links.map((link, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={link.label}
                    placeholder="Label"
                    onChange={e => onChange(prev => ({
                      ...prev,
                      nav: {
                        links: prev.nav.links.map((l, j) => j === i ? { ...l, label: e.target.value } : l),
                      },
                    }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-inter focus:outline-none focus:border-white/25 transition-colors"
                  />
                  <input
                    type="text"
                    value={link.href}
                    placeholder="/path"
                    onChange={e => onChange(prev => ({
                      ...prev,
                      nav: {
                        links: prev.nav.links.map((l, j) => j === i ? { ...l, href: e.target.value } : l),
                      },
                    }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/60 text-xs font-mono focus:outline-none focus:border-white/25 transition-colors"
                  />
                </div>
                <button
                  onClick={() => onChange(prev => ({
                    ...prev,
                    nav: { links: prev.nav.links.filter((_, j) => j !== i) },
                  }))}
                  className="mt-1 p-1.5 text-white/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => onChange(prev => ({
              ...prev,
              nav: { links: [...prev.nav.links, { id: Date.now().toString(), label: "New link", href: "/" }] },
            }))}
            className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors font-inter text-xs"
          >
            <Plus size={13} /> Add link
          </button>
        </div>
      )}

      {/* WhatsApp */}
      {section === "whatsapp" && (
        <div>
          <Field
            label="WhatsApp number (with country code)"
            value={config.whatsapp.phone}
            onChange={v => onChange(prev => ({ ...prev, whatsapp: { ...prev.whatsapp, phone: v } }))}
          />
          <p className="text-white/55 font-inter text-[10px] mt-1 mb-5">Example: 254712345678 (no + prefix)</p>

          <div className="flex items-center justify-between py-2">
            <p className="text-white/60 font-inter text-xs">WhatsApp bubble</p>
            <button
              onClick={() => onChange(prev => ({
                ...prev,
                whatsapp: { ...prev.whatsapp, bubbleEnabled: !prev.whatsapp.bubbleEnabled },
              }))}
              className="relative rounded-full transition-colors"
              style={{
                minWidth: "40px",
                height: "22px",
                background: config.whatsapp.bubbleEnabled ? "rgb(245 190 77 / 0.8)" : "rgb(255 255 255 / 0.15)",
              }}
            >
              <span
                className="absolute top-0.5 left-0.5 rounded-full bg-white shadow transition-transform"
                style={{
                  width: "18px",
                  height: "18px",
                  transform: config.whatsapp.bubbleEnabled ? "translateX(18px)" : "translateX(0)",
                }}
              />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      {section === "footer" && (
        <div>
          <Field
            label="Footer tagline"
            value={config.footer.tagline}
            onChange={v => onChange(prev => ({ ...prev, footer: { tagline: v } }))}
            multiline
          />
        </div>
      )}

      {/* Trust Bar */}
      {section === "trustbar" && (
        <div>
          {config.trustBar.items.map((item, i) => (
            <div key={i} className="mb-5 pb-5 border-b border-white/5 last:border-0">
              <p className="text-white/60 font-inter text-[10px] uppercase tracking-widest mb-3">Item {i + 1}</p>
              <Field
                label="Title"
                value={item.title}
                onChange={v => onChange(prev => ({
                  ...prev,
                  trustBar: { items: prev.trustBar.items.map((t, j) => j === i ? { ...t, title: v } : t) },
                }))}
              />
              <Field
                label="Subtitle"
                value={item.sub}
                onChange={v => onChange(prev => ({
                  ...prev,
                  trustBar: { items: prev.trustBar.items.map((t, j) => j === i ? { ...t, sub: v } : t) },
                }))}
              />
            </div>
          ))}
        </div>
      )}

      {/* Why Createch */}
      {section === "whycreatech" && (
        <div>
          <Field
            label="Section label"
            value={config.whyCreatech.sectionLabel}
            onChange={v => onChange(prev => ({ ...prev, whyCreatech: { ...prev.whyCreatech, sectionLabel: v } }))}
          />
          <Field
            label="Section title"
            value={config.whyCreatech.sectionTitle}
            onChange={v => onChange(prev => ({ ...prev, whyCreatech: { ...prev.whyCreatech, sectionTitle: v } }))}
          />
          <div className="h-px bg-white/5 my-4" />
          {config.whyCreatech.items.map((item, i) => (
            <div key={i} className="mb-5 pb-5 border-b border-white/5 last:border-0">
              <p className="text-white/60 font-inter text-[10px] uppercase tracking-widest mb-3">Card {i + 1}</p>
              <Field
                label="Title"
                value={item.title}
                onChange={v => onChange(prev => ({
                  ...prev,
                  whyCreatech: {
                    ...prev.whyCreatech,
                    items: prev.whyCreatech.items.map((t, j) => j === i ? { ...t, title: v } : t),
                  },
                }))}
              />
              <Field
                label="Description"
                value={item.description}
                onChange={v => onChange(prev => ({
                  ...prev,
                  whyCreatech: {
                    ...prev.whyCreatech,
                    items: prev.whyCreatech.items.map((t, j) => j === i ? { ...t, description: v } : t),
                  },
                }))}
                multiline
              />
            </div>
          ))}
        </div>
      )}

      {/* Testimonials */}
      {section === "testimonials" && (
        <div>
          <Field
            label="Section label"
            value={config.testimonials.sectionLabel}
            onChange={v => onChange(prev => ({ ...prev, testimonials: { ...prev.testimonials, sectionLabel: v } }))}
          />
          <Field
            label="Section title"
            value={config.testimonials.sectionTitle}
            onChange={v => onChange(prev => ({ ...prev, testimonials: { ...prev.testimonials, sectionTitle: v } }))}
          />
          <div className="h-px bg-white/5 my-4" />
          {config.testimonials.items.map((item, i) => (
            <div key={i} className="mb-5 pb-5 border-b border-white/5 last:border-0">
              <p className="text-white/60 font-inter text-[10px] uppercase tracking-widest mb-3">Review {i + 1}</p>
              <Field
                label="Quote"
                value={item.text}
                onChange={v => onChange(prev => ({
                  ...prev,
                  testimonials: {
                    ...prev.testimonials,
                    items: prev.testimonials.items.map((t, j) => j === i ? { ...t, text: v } : t),
                  },
                }))}
                multiline
              />
              <Field
                label="Name"
                value={item.name}
                onChange={v => onChange(prev => ({
                  ...prev,
                  testimonials: {
                    ...prev.testimonials,
                    items: prev.testimonials.items.map((t, j) => j === i ? { ...t, name: v } : t),
                  },
                }))}
              />
              <Field
                label="Detail"
                value={item.detail}
                onChange={v => onChange(prev => ({
                  ...prev,
                  testimonials: {
                    ...prev.testimonials,
                    items: prev.testimonials.items.map((t, j) => j === i ? { ...t, detail: v } : t),
                  },
                }))}
              />
            </div>
          ))}
        </div>
      )}

      {/* WhatsApp CTA + Newsletter */}
      {section === "wacta" && (
        <div>
          <p className="text-white/60 font-inter text-[10px] uppercase tracking-widest mb-3">WhatsApp CTA</p>
          <Field
            label="Headline"
            value={config.whatsAppCTA.headline}
            onChange={v => onChange(prev => ({ ...prev, whatsAppCTA: { ...prev.whatsAppCTA, headline: v } }))}
          />
          <Field
            label="Body text"
            value={config.whatsAppCTA.body}
            onChange={v => onChange(prev => ({ ...prev, whatsAppCTA: { ...prev.whatsAppCTA, body: v } }))}
            multiline
          />
          <div className="h-px bg-white/5 my-5" />
          <p className="text-white/60 font-inter text-[10px] uppercase tracking-widest mb-3">Newsletter</p>
          <Field
            label="Title"
            value={config.newsletter.title}
            onChange={v => onChange(prev => ({ ...prev, newsletter: { ...prev.newsletter, title: v } }))}
          />
          <Field
            label="Subtitle"
            value={config.newsletter.subtitle}
            onChange={v => onChange(prev => ({ ...prev, newsletter: { ...prev.newsletter, subtitle: v } }))}
            multiline
          />
        </div>
      )}
    </div>
  );
}
