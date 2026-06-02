"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { whatsappGeneralLink } from "@/lib/whatsapp";

function Logo() {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    return (
      <span className="font-playfair font-bold text-xl leading-tight">
        <span className="text-white">Createch</span>
        <span className="text-brand-yellow"> Hobbies</span>
      </span>
    );
  }

  return (
    <div className="relative h-10 w-44">
      <Image
        src="/images/logo.png"
        alt="Createch Hobbies"
        fill
        className="object-contain object-left"
        priority
        onError={() => setImgFailed(true)}
      />
    </div>
  );
}

const navLinks = [
  { href: "/",           label: "Home"       },
  { href: "/shop",       label: "Shop"       },
  { href: "/gift-guide", label: "Gift Guide" },
  { href: "/gallery",    label: "Gallery"    },
  { href: "/about",      label: "About"      },
  { href: "/contact",    label: "Contact"    },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled
          ? "bg-brand-dark/95 backdrop-blur-xl shadow-lg shadow-black/30 border-b border-brand-yellow/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group hover:opacity-85 transition-opacity">
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/70 hover:text-white font-medium transition-colors text-sm tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={whatsappGeneralLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-yellow px-5 py-2.5 rounded-full text-sm active:scale-95"
            >
              Order via WhatsApp
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white/80 hover:text-white p-2 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-brand-dark/98 backdrop-blur-xl px-4 pb-6 pt-2 border-t border-brand-yellow/10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-3 text-white/70 hover:text-white font-medium border-b border-white/5 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={whatsappGeneralLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block text-center btn-yellow px-5 py-3 rounded-full text-sm"
          >
            Order via WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
