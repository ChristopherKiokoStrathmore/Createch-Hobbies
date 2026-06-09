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
}
