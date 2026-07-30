"use client";

import { useEffect, useState, useCallback } from "react";
import { useIsEditorMode, useInspectMode } from "@/context/SiteConfigContext";

const KEY_LABELS: Record<string, string> = {
  "hero.headline":    "Hero · Headline",
  "hero.subheadline": "Hero · Subheadline",
  "hero.cta":         "Hero · Buttons",
  "nav":              "Navigation Links",
  "banner":           "Announcement Banner",
  "howItWorks":       "How It Works",
  "howItWorks.steps": "How It Works · Steps",
  "footer.tagline":   "Footer · Tagline",
  "whatsapp":         "WhatsApp Settings",
  "seo":              "SEO",
  "colours":          "Colours",
  "cardStyle":        "Component Style",
  "trustBar":         "Trust Bar",
  "whyCreatech":      "Why Createch",
  "testimonials":     "Testimonials",
  "whatsAppCTA":      "WhatsApp CTA",
  "newsletter":       "Newsletter",
  "heroStats":        "Hero · Stats",
  "shop.eyebrow":            "Shop · Eyebrow",
  "shop.title":              "Shop · Title",
  "shop.count":              "Shop · Kit count",
  "shop.searchPlaceholder":  "Shop · Search box",
  "shop.emptyMessage":       "Shop · No results",
  "shop.clearLabel":         "Shop · Clear filters",
  "shop.ageBrackets":        "Shop · Age filter",
  "shop.categoryFilterLabel":   "Shop · Category filter",
  "shop.difficultyFilterLabel": "Shop · Difficulty filter",
  "productPage.learnTitle":     "Kit page · Learning heading",
  "productPage.whatsInTheBox":  "Kit page · What's in the Box",
  "productPage.priceLabel":     "Kit page · Price label",
  "productPage.onSaleFormat":   "Kit page · Sale line",
  "productPage.delivery":       "Kit page · Delivery note",
  "productPage.orderHint":      "Kit page · Order hint",
  "productPage.relatedTitle":   "Kit page · Related heading",
  "productCard":                "Card · Badges & buttons",
};

// Fields owned by WooCommerce. These are deliberately NOT editable here: the
// store is the single source of truth for product data, and a second editable
// copy would let the two disagree about a price. Clicking one opens it in
// WooCommerce instead.
const PRODUCT_FIELD_LABELS: Record<string, string> = {
  "product.name":          "Kit name",
  "product.price":         "Price",
  "product.description":   "Short description",
  "product.category":      "Category",
  "product.ageRange":      "Age Range attribute",
  "product.difficulty":    "Difficulty attribute",
  "product.stock":         "Stock status",
  "product.featured":      "Featured star",
  "product.whatYouLearn":  "What You Learn attribute",
  "product.whatsInTheBox": "What's in the Box attribute",
};

const WOO_BLUE  = "#5b9cf6";
const WOO_AMBER = "#e08a2e";

interface Highlight {
  top: number;
  left: number;
  width: number;
  height: number;
  key: string;
  productId: string;
}

export default function EditorOverlay() {
  const isEditor      = useIsEditorMode();
  const inspectActive = useInspectMode();
  const [hl, setHl]   = useState<Highlight | null>(null);

  const findTarget = useCallback((x: number, y: number): HTMLElement | null => {
    const els = document.elementsFromPoint(x, y);
    for (const el of els) {
      const t = el.closest("[data-editor-key]") as HTMLElement | null;
      if (t) return t;
    }
    return null;
  }, []);

  useEffect(() => {
    if (!isEditor || !inspectActive) {
      setHl(null);
      return;
    }

    // Product ids ride on an ancestor (the card or the info panel), so a click on
    // any field inside knows which kit it belongs to.
    const productIdOf = (el: HTMLElement): string =>
      (el.closest("[data-product-id]") as HTMLElement | null)?.dataset.productId ?? "";

    const onMove = (e: MouseEvent) => {
      const target = findTarget(e.clientX, e.clientY);
      if (target) {
        const r = target.getBoundingClientRect();
        setHl({
          top: r.top, left: r.left, width: r.width, height: r.height,
          key: target.dataset.editorKey ?? "",
          productId: productIdOf(target),
        });
      } else {
        setHl(null);
      }
    };

    const onClick = (e: MouseEvent) => {
      const target = findTarget(e.clientX, e.clientY);
      if (!target) return;
      e.preventDefault();
      e.stopPropagation();
      window.parent.postMessage(
        {
          type:      "INSPECT_ELEMENT",
          key:       target.dataset.editorKey ?? "",
          productId: productIdOf(target),
        },
        "*",
      );
    };

    const onLeave = () => setHl(null);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("click", onClick, true);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [isEditor, inspectActive, findTarget]);

  if (!isEditor || !inspectActive || !hl) return null;

  const isProductField = hl.key.startsWith("product.");
  const accent         = isProductField ? WOO_AMBER : WOO_BLUE;
  const label          = isProductField
    ? `WooCommerce · ${PRODUCT_FIELD_LABELS[hl.key] ?? hl.key.replace("product.", "")}`
    : KEY_LABELS[hl.key] ?? hl.key;
  const action     = isProductField ? "open in WooCommerce" : "click to edit";
  const labelAbove = hl.top > 30;

  return (
    <div
      aria-hidden="true"
      style={{
        position:        "fixed",
        top:             hl.top    - 2,
        left:            hl.left   - 2,
        width:           hl.width  + 4,
        height:          hl.height + 4,
        // Dashed amber for WooCommerce-owned fields, so it reads as "this leaves
        // the editor" rather than "this is another text box".
        border:          `2px ${isProductField ? "dashed" : "solid"} ${accent}`,
        borderRadius:    "4px",
        pointerEvents:   "none",
        zIndex:          99999,
        backgroundColor: isProductField ? "rgba(224,138,46,0.09)" : "rgba(91,156,246,0.07)",
        boxSizing:       "border-box",
      }}
    >
      <span
        style={{
          position:    "absolute",
          [labelAbove ? "top" : "bottom"]: "-24px",
          left:        "-2px",
          background:  accent,
          color:       "#fff",
          fontSize:    "10px",
          fontFamily:  "Inter, sans-serif",
          fontWeight:  600,
          padding:     "3px 7px",
          borderRadius: labelAbove ? "3px 3px 3px 0" : "0 3px 3px 3px",
          whiteSpace:  "nowrap",
          letterSpacing: "0.03em",
          lineHeight:  1.4,
          userSelect:  "none",
        }}
      >
        {label}
      </span>
      <span
        style={{
          position:    "absolute",
          bottom:      "4px",
          right:       "6px",
          background:  isProductField ? "rgba(224,138,46,0.9)" : "rgba(91,156,246,0.85)",
          color:       "#fff",
          fontSize:    "9px",
          fontFamily:  "Inter, sans-serif",
          padding:     "2px 5px",
          borderRadius: "3px",
          letterSpacing: "0.04em",
          userSelect:  "none",
        }}
      >
        {action}
      </span>
    </div>
  );
}
