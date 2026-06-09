"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSiteConfig } from "@/context/SiteConfigContext";

function Logo({ scrolled }: { scrolled: boolean }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    return (
      <span className="font-playfair font-bold text-xl leading-tight">
        <span className={scrolled ? "text-brand-dark" : "text-white"}>Createch</span>
        <span className={scrolled ? "text-brand-purple" : "text-brand-yellow"}> Hobbies</span>
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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems, dispatch } = useCart();
  const { nav } = useSiteConfig();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled
          ? "bg-[#f5be4d]/95 backdrop-blur-xl shadow-lg shadow-brand-dark/10 border-b border-brand-dark/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center group hover:opacity-85 transition-opacity">
            <Logo scrolled={scrolled} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" data-editor-key="nav">
            {nav.links.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`font-medium transition-colors text-sm tracking-wide ${
                  scrolled
                    ? "text-brand-dark/70 hover:text-brand-dark"
                    : "text-white/90 hover:text-white drop-shadow-sm"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => dispatch({ type: "OPEN_CART" })}
              aria-label="Open cart"
              className={`relative flex items-center justify-center w-10 h-10 rounded-full border transition-all ${
                scrolled
                  ? "border-brand-dark/20 text-brand-dark/70 hover:border-brand-dark/50 hover:text-brand-dark"
                  : "border-white/30 text-white/80 hover:border-white/60 hover:text-white"
              }`}
            >
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-yellow text-brand-dark text-[10px] font-bold rounded-full flex items-center justify-center font-inter">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>
            <Link
              href="/checkout"
              className="btn-yellow px-5 py-2.5 rounded-full text-sm active:scale-95"
            >
              Checkout
            </Link>
          </div>

          {/* Mobile: cart icon + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => dispatch({ type: "OPEN_CART" })}
              aria-label="Open cart"
              className={`relative flex items-center justify-center w-9 h-9 transition-colors ${
                scrolled ? "text-brand-dark/70" : "text-white/80"
              }`}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-yellow text-brand-dark text-[9px] font-bold rounded-full flex items-center justify-center font-inter">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>
            <button
              className={`p-2 transition-colors ${scrolled ? "text-brand-dark/70 hover:text-brand-dark" : "text-white/80 hover:text-white"}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[#f5be4d]/98 backdrop-blur-xl px-4 pb-6 pt-2 border-t border-brand-dark/10">
          {nav.links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="block py-3 text-brand-dark/70 hover:text-brand-dark font-medium border-b border-brand-dark/10 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/checkout"
            className="mt-4 block text-center btn-yellow px-5 py-3 rounded-full text-sm"
            onClick={() => setMenuOpen(false)}
          >
            Checkout
          </Link>
        </div>
      </div>
    </header>
  );
}
