"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

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
        sizes="176px"
        className="object-contain object-left"
        priority
        onError={() => setImgFailed(true)}
      />
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const { totalItems, dispatch } = useCart();
  const { nav } = useSiteConfig();
  const { customer } = useCustomerAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait) and (max-width: 767px)");
    const update = () => setIsPortrait(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled
          ? "bg-[#f5be4d]/95 backdrop-blur-xl shadow-lg shadow-brand-dark/10 border-b border-brand-dark/10"
          : "bg-transparent"
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center group hover:opacity-85 transition-opacity">
            <Logo scrolled={scrolled} />
          </Link>

          {/* Desktop nav */}
          {/* gap tightens below xl so the account + cart icons don't squeeze a
              two-word link onto two lines at mid widths. */}
          <nav className="hidden md:flex items-center gap-5 xl:gap-8" data-editor-key="nav" aria-label="Main navigation">
            {nav.links.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`font-medium transition-colors text-sm tracking-wide whitespace-nowrap ${
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
            {/* /account bounces to the sign-in page when there is no session,
                so one link serves both states. */}
            <Link
              href="/account"
              aria-label={customer ? "Your account" : "Sign in"}
              title={customer ? "Your account" : "Sign in"}
              className={`relative flex items-center justify-center w-11 h-11 rounded-full border transition-all hover:scale-105 active:scale-95 ${
                scrolled
                  ? "border-brand-dark/20 text-brand-dark/70 hover:border-brand-dark/50 hover:text-brand-dark"
                  : "border-white/30 text-white/80 hover:border-white/60 hover:text-white"
              }`}
            >
              <User size={18} />
              {customer && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-brand-dark rounded-full" />
              )}
            </Link>
            <button
              onClick={() => dispatch({ type: "OPEN_CART" })}
              aria-label="Open cart"
              className={`relative flex items-center justify-center w-11 h-11 rounded-full border transition-all hover:scale-105 active:scale-95 ${
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
              className="btn-yellow px-6 py-2.5 rounded-full text-sm font-medium active:scale-95 hover:shadow-lg transition-all"
            >
              Checkout
            </Link>
          </div>

          {/* Mobile: cart icon + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={() => dispatch({ type: "OPEN_CART" })}
              aria-label="Open cart"
              className={`relative flex items-center justify-center w-11 h-11 rounded-lg transition-all active:scale-95 ${
                scrolled ? "text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5" : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-yellow text-brand-dark text-[10px] font-bold rounded-full flex items-center justify-center font-inter border border-white/30">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>
            <button
              className={`p-2.5 rounded-lg transition-all active:scale-95 ${scrolled ? "text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5" : "text-white/80 hover:text-white hover:bg-white/10"}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Portrait-only nav strip — skip "Home" (logo handles it), fit all in one row */}
      {isPortrait && (
        <div className="border-t border-black/8 bg-[#f5be4d]/50 backdrop-blur-sm">
          <div className="flex items-center justify-around px-2 py-1.5 overflow-x-auto">
            {nav.links
              .filter((link) => link.href !== "/")
              .map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-2.5 py-1.5 rounded-full text-[11px] font-medium font-inter transition-colors text-brand-dark/70 active:text-brand-dark active:bg-black/10 hover:text-brand-dark whitespace-nowrap flex-shrink-0"
                >
                  {link.label}
                </Link>
              ))}
          </div>
        </div>
      )}

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
            href="/account"
            className="flex items-center gap-2 py-3 text-brand-dark/70 hover:text-brand-dark font-medium border-b border-brand-dark/10 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            <User size={16} />
            {customer ? "My Account" : "Sign In"}
          </Link>
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
