"use client";

import Link from "next/link";
import NewsletterCapture from "@/components/layout/NewsletterCapture";
import { useSiteConfig } from "@/context/SiteConfigContext";

const footerLinks = {
  Shop: [
    { label: "All Kits",   href: "/shop" },
    { label: "Vehicles",   href: "/shop?category=Vehicles" },
    { label: "Machines",   href: "/shop?category=Machines" },
    { label: "Science",    href: "/shop?category=Science" },
    { label: "Robots",     href: "/shop?category=Robots" },
    { label: "Space",      href: "/shop?category=Space" },
    { label: "Gift Guide", href: "/gift-guide" },
  ],
  Help: [
    { label: "FAQ",      href: "/faq" },
    { label: "About Us", href: "/about" },
    { label: "Contact",  href: "/contact" },
  ],
};

export default function Footer() {
  const { whatsapp, footer } = useSiteConfig();
  const phone    = whatsapp.phone;
  const waLink   = `https://wa.me/c/${phone}`;
  const phoneDisplay = `+${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`;

  return (
    <footer className="border-t border-brand-dark/10" style={{ backgroundColor: "rgba(232,178,56,0.88)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">

        <NewsletterCapture />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-5">
              <span className="font-playfair font-bold text-xl">
                <span className="text-brand-dark">Createch</span>
                <span className="text-brand-purple"> Hobbies</span>
              </span>
            </Link>
            <p className="text-brand-dark/60 text-sm leading-relaxed max-w-xs font-inter" data-editor-key="footer.tagline">
              {footer.tagline}
            </p>
            <div className="mt-6 space-y-2">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/50 text-[#1a9e4a] px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {phoneDisplay}
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-playfair font-bold text-brand-dark text-sm uppercase tracking-widest mb-5">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-brand-dark/55 hover:text-brand-dark text-sm transition-colors font-inter"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-brand-dark/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-brand-dark/45 text-sm font-inter">
            © 2025 Createch Hobbies. Made with ❤️ in Nairobi, Kenya.
          </p>
          <p className="text-brand-dark/35 text-xs font-inter">
            All prices in KES · Delivery within Nairobi
          </p>
        </div>
      </div>
    </footer>
  );
}
