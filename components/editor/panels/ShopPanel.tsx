"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, AlertTriangle, ExternalLink } from "lucide-react";
import type { SiteConfig, AgeBracket } from "@/types/site-config";
import { ageBracketWarnings } from "@/lib/siteConfigValidation";

interface Props {
  config: SiteConfig;
  onChange: (patch: Partial<SiteConfig> | ((prev: SiteConfig) => SiteConfig)) => void;
  focusTab?: string;
}

type TabId = "shop" | "product" | "badges" | "stats" | "ages";

const TABS: { id: TabId; label: string }[] = [
  { id: "shop",    label: "Shop page" },
  { id: "product", label: "Kit page"  },
  { id: "badges",  label: "Badges"    },
  { id: "ages",    label: "Age filter"},
  { id: "stats",   label: "Hero stats"},
];

function Field({
  label, value, onChange, hint, multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  multiline?: boolean;
}) {
  return (
    <div className="mb-4">
      <label className="block text-white/75 font-inter text-[11px] uppercase tracking-widest mb-1.5">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-inter resize-none focus:outline-none focus:border-white/25 transition-colors"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-inter focus:outline-none focus:border-white/25 transition-colors"
        />
      )}
      {hint && <p className="text-white/55 font-inter text-[10px] mt-1">{hint}</p>}
    </div>
  );
}

/** Editable string list — used for the default box contents. */
function ListEditor({
  items, onChange, addLabel, hint,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  addLabel: string;
  hint?: string;
}) {
  return (
    <div className="mb-4">
      {hint && <p className="text-white/55 font-inter text-[10px] mb-2">{hint}</p>}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-1.5">
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-inter focus:outline-none focus:border-white/25 transition-colors"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              aria-label={`Remove item ${i + 1}`}
              className="shrink-0 px-2 rounded-lg border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/40 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="mt-2 flex items-center gap-1.5 text-white/60 hover:text-white font-inter text-[11px] transition-colors"
      >
        <Plus size={12} /> {addLabel}
      </button>
    </div>
  );
}

export default function ShopPanel({ config, onChange, focusTab }: Props) {
  const [tab, setTab] = useState<TabId>("shop");

  // Jump to the right tab when click-to-inspect fires. Runs on every change, not
  // just mount, because the panel stays mounted between clicks in the preview.
  useEffect(() => {
    if (focusTab && TABS.some((t) => t.id === focusTab)) {
      setTab(focusTab as TabId);
    }
  }, [focusTab]);

  const setShop = (key: keyof SiteConfig["shop"]) => (val: string) =>
    onChange((prev) => ({ ...prev, shop: { ...prev.shop, [key]: val } }));
  const setProduct = (key: keyof SiteConfig["productPage"]) => (val: string) =>
    onChange((prev) => ({ ...prev, productPage: { ...prev.productPage, [key]: val } }));
  const setCard = (key: keyof SiteConfig["productCard"]) => (val: string) =>
    onChange((prev) => ({ ...prev, productCard: { ...prev.productCard, [key]: val } }));

  const setBrackets = (next: AgeBracket[]) =>
    onChange((prev) => ({ ...prev, shop: { ...prev.shop, ageBrackets: next } }));

  const warnings = ageBracketWarnings(config.shop.ageBrackets);

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-2.5 py-1 rounded-md font-inter text-[10px] uppercase tracking-wider transition-colors ${
              tab === t.id
                ? "bg-white/15 text-white"
                : "text-white/45 hover:text-white/80"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "shop" && (
        <>
          <Field label="Eyebrow" value={config.shop.eyebrow} onChange={setShop("eyebrow")} hint="Small label above the page title" />
          <Field label="Page title" value={config.shop.title} onChange={setShop("title")} />
          <Field label="Search placeholder" value={config.shop.searchPlaceholder} onChange={setShop("searchPlaceholder")} />
          <Field label="Count — one kit" value={config.shop.countOne} onChange={setShop("countOne")} hint="{n} is replaced with the number" />
          <Field label="Count — many kits" value={config.shop.countMany} onChange={setShop("countMany")} hint="{n} is replaced with the number" />
          <Field label="No results message" value={config.shop.emptyMessage} onChange={setShop("emptyMessage")} />

          <div className="h-px bg-white/5 my-5" />
          <p className="text-white/60 font-inter text-[10px] uppercase tracking-widest mb-4">Filter headings</p>
          <Field label="Age filter" value={config.shop.ageFilterLabel} onChange={setShop("ageFilterLabel")} />
          <Field label="Category filter" value={config.shop.categoryFilterLabel} onChange={setShop("categoryFilterLabel")} />
          <Field label="Difficulty filter" value={config.shop.difficultyFilterLabel} onChange={setShop("difficultyFilterLabel")} />
          <Field label='"All" option' value={config.shop.allLabel} onChange={setShop("allLabel")} />
          <Field label="Clear filters link" value={config.shop.clearLabel} onChange={setShop("clearLabel")} />
        </>
      )}

      {tab === "product" && (
        <>
          <Field label="Learning section heading" value={config.productPage.learnTitle} onChange={setProduct("learnTitle")} hint="Hidden on kits with no What You Learn attribute" />

          <div className="h-px bg-white/5 my-5" />
          <p className="text-white/60 font-inter text-[10px] uppercase tracking-widest mb-1.5">What&apos;s in the Box</p>
          <Field label="Heading" value={config.productPage.whatsInTheBoxTitle} onChange={setProduct("whatsInTheBoxTitle")} />
          <ListEditor
            items={config.productPage.whatsInTheBoxItems}
            onChange={(next) => onChange((prev) => ({
              ...prev,
              productPage: { ...prev.productPage, whatsInTheBoxItems: next },
            }))}
            addLabel="Add a line"
            hint="Used for kits that don't list their own contents. To write a specific list for one kit, add a “What's in the Box” attribute to that product in WooCommerce."
          />

          <div className="h-px bg-white/5 my-5" />
          <Field label="Price label" value={config.productPage.priceLabel} onChange={setProduct("priceLabel")} />
          <Field label="Sale line" value={config.productPage.onSaleFormat} onChange={setProduct("onSaleFormat")} hint="{amount} is replaced with the saving" />
          <Field label="Delivery note — line 1" value={config.productPage.deliveryLine1} onChange={setProduct("deliveryLine1")} />
          <Field label="Delivery note — line 2" value={config.productPage.deliveryLine2} onChange={setProduct("deliveryLine2")} />
          <Field label="Under the order button" value={config.productPage.orderHint} onChange={setProduct("orderHint")} multiline hint="Leave empty to hide this line" />
          <Field label="Related kits heading" value={config.productPage.relatedTitle} onChange={setProduct("relatedTitle")} />
        </>
      )}

      {tab === "badges" && (
        <>
          <p className="text-white/55 font-inter text-[10px] mb-4">
            Wording only. Which kits actually get a badge is decided in WooCommerce — Popular follows
            the Featured star, Sale follows a sale price, and stock follows Inventory.
          </p>
          <Field label="Featured badge" value={config.productCard.featuredBadge} onChange={setCard("featuredBadge")} />
          <Field label="Sale badge" value={config.productCard.saleBadge} onChange={setCard("saleBadge")} />
          <Field label="Out of stock badge" value={config.productCard.outOfStockBadge} onChange={setCard("outOfStockBadge")} />
          <Field label="Sold out button" value={config.productCard.soldOutLabel} onChange={setCard("soldOutLabel")} />
          <Field label="Add to cart — full" value={config.productCard.addToCartLabel} onChange={setCard("addToCartLabel")} />
          <Field label="Add to cart — small screens" value={config.productCard.addToCartShort} onChange={setCard("addToCartShort")} />
          <Field label="Age badge suffix" value={config.productCard.ageSuffix} onChange={setCard("ageSuffix")} hint='Shown after the range, e.g. "6–12 yrs". Leave empty for just the numbers.' />
        </>
      )}

      {tab === "ages" && (
        <>
          <p className="text-white/55 font-inter text-[10px] mb-4">
            A kit appears in a bracket when its own age range overlaps these years. Ranges come from
            each product&apos;s <span className="text-white/75">Age Range</span> attribute in
            WooCommerce — if that is not set, every kit is treated as 6–12 and the filter cannot
            separate them.
          </p>

          {warnings.length > 0 && (
            <div className="mb-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3">
              {warnings.map((w) => (
                <p key={w} className="flex gap-2 text-amber-200/90 font-inter text-[11px] leading-relaxed mb-1.5 last:mb-0">
                  <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                  {w}
                </p>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {config.shop.ageBrackets.map((b, i) => {
              const invalid = b.min > b.max;
              return (
                <div
                  key={b.id}
                  className={`rounded-lg border p-2.5 ${invalid ? "border-red-400/50 bg-red-400/5" : "border-white/10"}`}
                >
                  <div className="flex gap-1.5 mb-2">
                    <input
                      type="text"
                      value={b.label}
                      onChange={(e) => {
                        const next = [...config.shop.ageBrackets];
                        next[i] = { ...b, label: e.target.value };
                        setBrackets(next);
                      }}
                      placeholder="Label"
                      className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-inter focus:outline-none focus:border-white/25"
                    />
                    <button
                      type="button"
                      onClick={() => setBrackets(config.shop.ageBrackets.filter((_, j) => j !== i))}
                      aria-label={`Remove ${b.label}`}
                      className="shrink-0 px-2 rounded-lg border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/40 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-white/45 font-inter text-[10px] uppercase tracking-wider">Ages</label>
                    <input
                      type="number" min={0} max={99} value={b.min}
                      onChange={(e) => {
                        const next = [...config.shop.ageBrackets];
                        next[i] = { ...b, min: parseInt(e.target.value, 10) || 0 };
                        setBrackets(next);
                      }}
                      className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-white/25"
                    />
                    <span className="text-white/35 text-xs">to</span>
                    <input
                      type="number" min={0} max={99} value={b.max}
                      onChange={(e) => {
                        const next = [...config.shop.ageBrackets];
                        next[i] = { ...b, max: parseInt(e.target.value, 10) || 0 };
                        setBrackets(next);
                      }}
                      className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-white/25"
                    />
                    {invalid && (
                      <span className="text-red-400 font-inter text-[10px]">
                        Start is after the end — this bracket will be dropped.
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setBrackets([
              ...config.shop.ageBrackets,
              { id: `bracket-${Date.now()}`, label: "New bracket", min: 0, max: 99 },
            ])}
            className="mt-3 flex items-center gap-1.5 text-white/60 hover:text-white font-inter text-[11px] transition-colors"
          >
            <Plus size={12} /> Add a bracket
          </button>
        </>
      )}

      {tab === "stats" && (
        <>
          <p className="text-white/55 font-inter text-[10px] mb-4">
            The four counters under the hero headline. Numbers ending in <code className="text-white/70">+</code>{" "}
            or written as a range like <code className="text-white/70">1–2</code> count up when scrolled into view.
          </p>
          <div className="space-y-2">
            {config.heroStats.map((s, i) => (
              <div key={i} className="flex gap-1.5">
                <input
                  type="text"
                  value={s.value}
                  onChange={(e) => {
                    const next = [...config.heroStats];
                    next[i] = { ...s, value: e.target.value };
                    onChange((prev) => ({ ...prev, heroStats: next }));
                  }}
                  className="w-20 shrink-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-white/25"
                />
                <input
                  type="text"
                  value={s.label}
                  onChange={(e) => {
                    const next = [...config.heroStats];
                    next[i] = { ...s, label: e.target.value };
                    onChange((prev) => ({ ...prev, heroStats: next }));
                  }}
                  className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-inter focus:outline-none focus:border-white/25"
                />
                <button
                  type="button"
                  onClick={() => onChange((prev) => ({
                    ...prev,
                    heroStats: prev.heroStats.filter((_, j) => j !== i),
                  }))}
                  aria-label={`Remove ${s.label}`}
                  className="shrink-0 px-2 rounded-lg border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/40 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onChange((prev) => ({
              ...prev,
              heroStats: [...prev.heroStats, { value: "0+", label: "New stat" }],
            }))}
            className="mt-3 flex items-center gap-1.5 text-white/60 hover:text-white font-inter text-[11px] transition-colors"
          >
            <Plus size={12} /> Add a stat
          </button>
        </>
      )}

      <div className="h-px bg-white/5 my-5" />
      <p className="flex gap-2 text-white/45 font-inter text-[10px] leading-relaxed">
        <ExternalLink size={11} className="shrink-0 mt-0.5" />
        Kit names, prices, photos, stock, categories, ages and difficulty live in WooCommerce. Click
        one in the preview to open it there.
      </p>
    </div>
  );
}
