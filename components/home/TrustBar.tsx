"use client";

import { useSiteConfig } from "@/context/SiteConfigContext";

function PuzzleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="w-6 h-6 text-brand-purple shrink-0">
      <path d="M3 3 L8.5 3 C8.5 3 8 1 9.5 1 C11 1 10.5 3 10.5 3 L16 3 L16 8.5 C16 8.5 18 8 18 9.5 C18 11 16 10.5 16 10.5 L16 16 L10.5 16 C10.5 16 11 18 9.5 18 C8 18 8.5 16 8.5 16 L3 16 L3 10.5 C3 10.5 1 11 1 9.5 C1 8 3 8.5 3 8.5 Z" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="w-6 h-6 text-brand-purple shrink-0">
      <rect x="1" y="7" width="13" height="9" rx="0.5" />
      <path d="M14 7 L14 5 L18 5 L21 8 L21 16 L14 16" />
      <line x1="14" y1="8" x2="21" y2="8" />
      <line x1="9" y1="7" x2="9" y2="16" />
      <circle cx="5" cy="16" r="2" />
      <circle cx="17.5" cy="16" r="2" />
    </svg>
  );
}

function ChatBubbleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="w-6 h-6 text-brand-purple shrink-0">
      <path d="M21 4 C21 2.9 20.1 2 19 2 L5 2 C3.9 2 3 2.9 3 4 L3 14 C3 15.1 3.9 16 5 16 L8 16 L8 21 L13 16 L19 16 C20.1 16 21 15.1 21 14 Z" />
      <circle cx="8.5" cy="9" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="12" cy="9" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="9" r="0.85" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PriceTagIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="w-6 h-6 text-brand-purple shrink-0">
      <path d="M3 3 L14 3 L21 11.5 L14 20 L3 20 Z" />
      <circle cx="7" cy="7" r="1.5" />
    </svg>
  );
}

const ICONS = [PuzzleIcon, TruckIcon, ChatBubbleIcon, PriceTagIcon];

export default function TrustBar() {
  const { trustBar } = useSiteConfig();

  return (
    <div
      className="border-y"
      data-editor-key="trustBar"
      style={{ background: "rgba(245,190,77,0.75)", borderColor: "rgba(10,10,15,0.10)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-brand-dark/10">
          {trustBar.items.map((p, i) => {
            const Icon = ICONS[i] ?? PuzzleIcon;
            return (
              <div key={i} className="flex items-center gap-3 py-4 px-4 sm:px-6">
                <Icon />
                <div>
                  <div className="text-brand-dark font-semibold text-sm font-inter leading-tight">{p.title}</div>
                  <div className="text-brand-dark/55 text-xs font-inter mt-0.5">{p.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
