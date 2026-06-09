import type { SiteConfig } from "@/types/site-config";

export const DEFAULT_CONFIG: SiteConfig = {
  tokens: {
    yellow: "#f5be4d",
    purple: "#754398",
    dark:   "#0a0a0f",
  },
  typography: {
    headingFont: "Playfair Display",
    bodyFont:    "Inter",
  },
  banner: {
    enabled:     false,
    text:        "🎉 Free delivery on orders over KES 3,000!",
    bgColor:     "#754398",
    textColor:   "#ffffff",
    link:        "/shop",
    linkLabel:   "Shop Now",
    dismissible: true,
  },
  nav: {
    links: [
      { id: "1", label: "Home",       href: "/"           },
      { id: "2", label: "Shop",       href: "/shop"       },
      { id: "3", label: "Gift Guide", href: "/gift-guide" },
      { id: "4", label: "Gallery",    href: "/gallery"    },
      { id: "7", label: "Blog",       href: "/blog"       },
      { id: "5", label: "About",      href: "/about"      },
      { id: "6", label: "Contact",    href: "/contact"    },
    ],
  },
  hero: {
    headline:          "Build Something Amazing Today",
    subheadline:       "DIY kits that spark creativity, teach STEM skills, and turn every child into a builder.",
    ctaPrimaryLabel:   "Shop All Kits",
    ctaPrimaryHref:    "/shop",
    ctaSecondaryLabel: "Gift Guide",
    ctaSecondaryHref:  "/gift-guide",
  },
  howItWorks: {
    sectionLabel: "How It Works",
    sectionTitle: "Three Steps to Building Fun",
    steps: [
      {
        title:       "Choose Your Kit",
        description: "Browse 17 DIY kit types: vehicles, robots, science experiments, and more. Use filters to find the right kit by age or difficulty.",
      },
      {
        title:       "We Deliver to You",
        description: "Order via WhatsApp and we deliver to your door across Nairobi in 1–2 business days. We'll confirm delivery charges and timing when you message us.",
      },
      {
        title:       "Build & Have Fun!",
        description: "Follow the step-by-step instructions and assemble your kit. No glue, no mess. Just pure building joy.",
      },
    ],
  },
  whatsapp: {
    phone:         "254742152233",
    bubbleEnabled: true,
  },
  footer: {
    tagline: "DIY assembly kits that turn every child into a builder, inventor, and engineer. Based in Nairobi, Kenya.",
  },
  seo: {
    title:         "Createch Hobbies | DIY Kits for Kids",
    description:   "Build something amazing! DIY assembly kits that spark creativity and STEM learning in every child. Shop 17+ kit types, delivered across Nairobi.",
    ogTitle:       "Createch Hobbies | DIY Kits for Kids",
    ogDescription: "Build something amazing! DIY assembly kits that spark creativity and STEM learning.",
    ogImage:       "",
  },
  trustBar: {
    items: [
      { title: "Snap-Fit Assembly", sub: "No glue, no tools needed"         },
      { title: "Nairobi Delivery",  sub: "Usually 1–2 business days"        },
      { title: "WhatsApp Support",  sub: "We reply within minutes"          },
      { title: "From KES 400",      sub: "Affordable STEM for every family" },
    ],
  },
  whyCreatech: {
    sectionLabel: "Why Choose Us",
    sectionTitle: "Why Parents Love Createch",
    items: [
      { title: "STEM Learning in Disguise",    description: "Every kit teaches real engineering, physics, or science principles, wrapped in pure, irresistible fun that kids love."                                                               },
      { title: "Parent–Child Time, Redefined", description: "Step away from screens and into something real. Building together sparks conversations, creates memories, and strengthens the bond that matters most."                                  },
      { title: "Age-Appropriate Challenges",   description: "Kits rated Beginner to Advanced for ages 5–14. Always just challenging enough to feel like a real achievement."                                                                      },
      { title: "Affordable STEM",              description: "Starting from just KES 400. Quality STEM education shouldn't require a big budget."                                                                                                  },
      { title: "Everything Included",          description: "Each kit comes with all parts, instructions, and a guide explaining the science behind what you built."                                                                              },
      { title: "The Gift They'll Remember",    description: "Forget toys that break in a day. These kits are built, displayed, and played with for months."                                                                                       },
    ],
  },
  testimonials: {
    sectionLabel: "Customer Feedback",
    sectionTitle: "What Families Are Saying",
    items: [
      { text: "My son built the Hydraulic Digger over a weekend and hasn't stopped talking about hydraulics since! Worth every shilling.", name: "Amina W.", detail: "Mum · Hydraulic Digger Kit" },
      { text: "Ordered via WhatsApp on a Saturday, received it Sunday morning. The Marble Run is now a permanent fixture in our living room.", name: "Grace M.", detail: "Mum · Marble Run Kit" },
      { text: "Great quality for the price. My son built the Tank kit then started modifying it. He's been at it for weeks.", name: "John O.", detail: "Dad · Tank Kit" },
      { text: "My daughter finished the Windmill Kit in one afternoon and immediately asked for the next one. Best KES 1,500 I've spent.", name: "Faith K.", detail: "Mum · Windmill Kit" },
    ],
  },
  whatsAppCTA: {
    headline: "Need Help Choosing?",
    body:     "Not sure which kit fits your child's age or interest? Have a question about a product? We're here. Chat with us on WhatsApp and we'll reply within minutes.",
  },
  newsletter: {
    title:    "Stay Updated",
    subtitle: "New kits, promotions, and STEM ideas. Straight to your WhatsApp.",
  },
  sections: [
    { id: "hero",             label: "Hero",              visible: true },
    { id: "trustBar",         label: "Trust Bar",         visible: true },
    { id: "howItWorks",       label: "How It Works",      visible: true },
    { id: "featuredProducts", label: "Featured Products", visible: true },
    { id: "testimonials",     label: "Testimonials",      visible: true },
    { id: "whyCreatetech",    label: "Why Createtech",    visible: true },
    { id: "categoryShowcase", label: "Category Showcase", visible: true },
    { id: "ourCommunity",     label: "Our Community",     visible: true },
    { id: "whatsappCTA",      label: "WhatsApp CTA",      visible: true },
  ],
  cardStyle: {
    borderRadius: 16,
    shadowLevel:  "soft",
    bgColor:      "rgba(230,160,20,0.22)",
    borderColor:  "rgba(245,190,77,0.45)",
  },
};
