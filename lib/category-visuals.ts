import {
  Car, Cog, FlaskConical, Rocket, Bot, Building2, Puzzle,
  CircuitBoard, Radio, Plane, Globe, Sun, type LucideIcon,
} from "lucide-react";

/**
 * How a category LOOKS — never which categories exist.
 *
 * WooCommerce owns the category list; this module only decides the icon, emoji
 * and colour for whatever name comes back. Matching is by keyword, so renaming
 * or adding a category in the Woo admin never leaves a blank tile: an unmatched
 * name still renders, with a rotating palette and a neutral puzzle icon.
 */

export interface CategoryPalette {
  gradient:  string;
  glowBase:  string;
  glowHover: string;
}

const PALETTES = {
  red:    { gradient: "from-[#f56a77] to-[#b83347]", glowBase: "rgba(245,106,119,0.22)", glowHover: "rgba(245,106,119,0.60)" },
  blue:   { gradient: "from-[#418cdb] to-[#1a5ca8]", glowBase: "rgba(65,140,219,0.22)",  glowHover: "rgba(65,140,219,0.60)"  },
  teal:   { gradient: "from-[#82bec6] to-[#3d8c99]", glowBase: "rgba(130,190,198,0.22)", glowHover: "rgba(130,190,198,0.60)" },
  brown:  { gradient: "from-[#644536] to-[#3a2518]", glowBase: "rgba(100,69,54,0.22)",   glowHover: "rgba(100,69,54,0.55)"   },
  orange: { gradient: "from-[#e88062] to-[#b54a28]", glowBase: "rgba(232,128,98,0.22)",  glowHover: "rgba(232,128,98,0.60)"  },
  purple: { gradient: "from-[#7a5fd0] to-[#452e91]", glowBase: "rgba(122,95,208,0.22)",  glowHover: "rgba(122,95,208,0.60)"  },
  green:  { gradient: "from-[#5cc48f] to-[#2b8f5c]", glowBase: "rgba(92,196,143,0.22)",  glowHover: "rgba(92,196,143,0.60)"  },
  amber:  { gradient: "from-[#f0b93e] to-[#b3831a]", glowBase: "rgba(240,185,62,0.22)",  glowHover: "rgba(240,185,62,0.60)"  },
} satisfies Record<string, CategoryPalette>;

interface Rule {
  pattern: RegExp;
  Icon:    LucideIcon;
  emoji:   string;
  palette: CategoryPalette;
}

// Order matters: the first match wins, so put the more specific phrases first.
const RULES: Rule[] = [
  { pattern: /without batteries|no battery|solar|manual/i, Icon: Sun,          emoji: "☀️", palette: PALETTES.amber  },
  { pattern: /robot/i,                                     Icon: Bot,          emoji: "🤖", palette: PALETTES.orange },
  { pattern: /vehicle|car|truck|train|drive/i,             Icon: Car,          emoji: "🚗", palette: PALETTES.red    },
  { pattern: /aviation|plane|flight|aero|glider/i,         Icon: Plane,        emoji: "✈️", palette: PALETTES.blue   },
  { pattern: /space|rocket|lunar|astro/i,                  Icon: Rocket,       emoji: "🚀", palette: PALETTES.brown  },
  { pattern: /wireless|remote|radio|signal/i,              Icon: Radio,        emoji: "📡", palette: PALETTES.purple },
  { pattern: /circuit|electr|power|battery/i,              Icon: CircuitBoard, emoji: "🔌", palette: PALETTES.green  },
  { pattern: /mechanic|machine|gear|engine/i,              Icon: Cog,          emoji: "⚙️", palette: PALETTES.blue   },
  { pattern: /real world|everyday|life/i,                  Icon: Globe,        emoji: "🌍", palette: PALETTES.teal   },
  { pattern: /architect|building|structure|house/i,        Icon: Building2,    emoji: "🏗️", palette: PALETTES.brown },
  { pattern: /science|lab|experiment|chem|optic/i,         Icon: FlaskConical, emoji: "🔬", palette: PALETTES.teal   },
];

const FALLBACK_PALETTES: CategoryPalette[] = [
  PALETTES.purple, PALETTES.amber, PALETTES.green, PALETTES.teal,
];

const DEFAULT_EMOJI = "🧩"; // puzzle piece

export interface CategoryVisual {
  Icon:    LucideIcon;
  emoji:   string;
  palette: CategoryPalette;
}

/**
 * Icon, emoji and palette for a category name.
 * `index` only varies the fallback palette so a row of unmatched categories
 * does not come out in a single colour.
 */
export function categoryVisual(name: string | undefined, index = 0): CategoryVisual {
  const rule = name ? RULES.find((r) => r.pattern.test(name)) : undefined;
  return {
    Icon:    rule?.Icon    ?? Puzzle,
    emoji:   rule?.emoji   ?? DEFAULT_EMOJI,
    palette: rule?.palette ?? FALLBACK_PALETTES[index % FALLBACK_PALETTES.length],
  };
}

/** Convenience for the image placeholders, which only need the emoji. */
export function categoryEmoji(name: string | undefined): string {
  return categoryVisual(name).emoji;
}
