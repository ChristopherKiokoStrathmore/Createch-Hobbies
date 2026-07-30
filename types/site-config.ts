export interface NavLink {
  id: string;
  label: string;
  href: string;
}

export interface HowItWorksStep {
  title: string;
  description: string;
}

export interface SiteSection {
  id: string;
  label: string;
  visible: boolean;
}

export type ShadowLevel = "none" | "soft" | "medium" | "strong";

export interface HeroStat {
  value: string;
  label: string;
}

/**
 * An age filter on the shop page. `min`/`max` are inclusive years.
 *
 * A product matches when its own age range *overlaps* the bracket, which is the
 * ordinary meaning of "suitable for this age" — a kit rated 8–12 belongs in both
 * "Ages 7–9" and "Ages 10–12" because it genuinely suits a 9-year-old and an
 * 11-year-old. Use a large `max` (e.g. 99) for an open-ended top bracket.
 */
export interface AgeBracket {
  id:    string;
  label: string;
  min:   number;
  max:   number;
}

export interface SiteConfig {
  tokens: {
    yellow: string;
    purple: string;
    dark: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  banner: {
    enabled: boolean;
    text: string;
    bgColor: string;
    textColor: string;
    link: string;
    linkLabel: string;
    dismissible: boolean;
  };
  nav: {
    links: NavLink[];
  };
  hero: {
    headline: string;
    subheadline: string;
    ctaPrimaryLabel: string;
    ctaPrimaryHref: string;
    ctaSecondaryLabel: string;
    ctaSecondaryHref: string;
  };
  howItWorks: {
    sectionLabel: string;
    sectionTitle: string;
    steps: HowItWorksStep[];
  };
  whatsapp: {
    phone: string;
    bubbleEnabled: boolean;
  };
  footer: {
    tagline: string;
  };
  seo: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
  };
  trustBar: {
    items: Array<{ title: string; sub: string }>;
  };
  whyCreatech: {
    sectionLabel: string;
    sectionTitle: string;
    items: Array<{ title: string; description: string }>;
  };
  testimonials: {
    sectionLabel: string;
    sectionTitle: string;
    items: Array<{ text: string; name: string; detail: string }>;
  };
  whatsAppCTA: {
    headline: string;
    body: string;
  };
  newsletter: {
    title: string;
    subtitle: string;
  };
  sections: SiteSection[];
  cardStyle: {
    borderRadius: number;
    shadowLevel: ShadowLevel;
    bgColor: string;
    borderColor: string;
  };

  /** The four counters under the hero headline. */
  heroStats: HeroStat[];

  /** Shop listing page: headings, filter labels and the age brackets. */
  shop: {
    eyebrow:           string;
    title:             string;
    searchPlaceholder: string;
    /** `{n}` is replaced with the number of kits. */
    countOne:          string;
    countMany:         string;
    emptyMessage:      string;
    ageFilterLabel:        string;
    categoryFilterLabel:   string;
    difficultyFilterLabel: string;
    allLabel:          string;
    clearLabel:        string;
    ageBrackets:       AgeBracket[];
  };

  /** Individual product page copy. */
  productPage: {
    whatsInTheBoxTitle: string;
    /** Fallback list, used when a product has no "What's in the Box" attribute. */
    whatsInTheBoxItems: string[];
    learnTitle:         string;
    priceLabel:         string;
    deliveryLine1:      string;
    deliveryLine2:      string;
    orderHint:          string;
    relatedTitle:       string;
    /** `{amount}` is replaced with the formatted saving. */
    onSaleFormat:       string;
  };

  /** Badges and buttons on the product cards in the shop grid. */
  productCard: {
    featuredBadge:   string;
    saleBadge:       string;
    outOfStockBadge: string;
    soldOutLabel:    string;
    addToCartLabel:  string;
    addToCartShort:  string;
    /** Appended to the age range on the card badge, e.g. "6–12 yrs". */
    ageSuffix:       string;
  };
}
