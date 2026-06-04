"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Users, ExternalLink, LogOut } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

const NAV = [
  { href: "/admin",           label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders",    label: "Orders",    icon: ShoppingBag     },
  { href: "/admin/customers", label: "Customers", icon: Users           },
];

function Sidebar() {
  const { signOut } = useAdminAuth();
  const pathname    = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-[#060410] border-r border-white/5 fixed top-0 left-0 h-full flex flex-col z-40 text-white">
      {/* Logo */}
      <div className="h-16 px-5 flex items-center border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 shrink-0">
            <Image src="/images/logo.png" alt="Createch" fill className="object-contain" />
          </div>
          <div>
            <p className="font-inter font-semibold text-sm leading-none" style={{ color: "#ffffff" }}>Createch</p>
            <p className="text-brand-yellow font-inter text-[10px] uppercase tracking-widest leading-none mt-0.5">
              Admin
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-inter text-sm transition-all ${
                active
                  ? "bg-brand-yellow/10 text-brand-yellow font-medium"
                  : "text-white hover:bg-white/5"
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2 : 1.5} />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-yellow" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 pt-3 border-t border-white/5 space-y-0.5">
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white font-inter text-sm transition-colors"
        >
          <ExternalLink size={14} />
          View store
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:text-red-400 font-inter text-sm transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { pin, loaded } = useAdminAuth();

  if (!loaded) {
    return <div className="min-h-screen bg-brand-dark" />;
  }

  if (!pin) {
    return <div className="min-h-screen bg-brand-dark">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-brand-dark">
      <Sidebar />
      <div className="ml-60 flex-1 min-w-0 overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
