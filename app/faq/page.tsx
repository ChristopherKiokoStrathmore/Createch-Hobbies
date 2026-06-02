"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { whatsappGeneralLink } from "@/lib/whatsapp";

const faqs = [
  {
    q: "How long does delivery take?",
    a: "We deliver across Nairobi in 1–2 business days. Once you place your order on WhatsApp, we'll confirm the exact timing based on your location.",
  },
  {
    q: "How much does delivery cost?",
    a: "Delivery charges vary by location within Nairobi. We'll confirm the cost when you message us to order — no surprises.",
  },
  {
    q: "Do I need tools or glue to build the kits?",
    a: "No tools, no glue, no mess. All our kits use snap-fit assembly — everything clicks together. Your child can build with just their hands.",
  },
  {
    q: "What age are the kits suitable for?",
    a: "Our kits cover ages 5 to 14. Each kit is rated Beginner, Intermediate, or Advanced, and lists the recommended age range on its product page. Use the age filter on our Shop page to browse by age group.",
  },
  {
    q: "Can my child build it alone?",
    a: "Beginner kits (ages 5–9) can be done mostly independently with light parental guidance. Intermediate and Advanced kits (ages 10+) may need a parent to assist with the more complex steps — which also makes it a great parent-child activity.",
  },
  {
    q: "What if parts are missing or broken?",
    a: "Message us on WhatsApp immediately with a photo. We'll replace any defective or missing parts at no charge. Your child's experience matters more than anything.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept M-Pesa and cash on delivery. Payment is confirmed before we dispatch.",
  },
  {
    q: "Can I return a kit?",
    a: "We don't accept returns on opened kits. However, if your kit arrives damaged or has defective parts, we'll replace it — just send us a photo on WhatsApp.",
  },
  {
    q: "Do you deliver outside Nairobi?",
    a: "We're currently Nairobi-based. If you're outside Nairobi, message us — we can explore courier options for you.",
  },
  {
    q: "Are these kits good for school projects?",
    a: "Absolutely. Many of our kits directly relate to physics, engineering, and science topics taught in school. The Solar Fan, Hydraulic Digger, and Windmill are popular for STEM projects.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-2xl border transition-all duration-200 overflow-hidden"
      style={{
        borderColor: open ? "rgba(245,190,77,0.25)" : "rgba(255,255,255,0.06)",
        background: open ? "rgba(245,190,77,0.04)" : "rgba(26,22,37,0.7)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-playfair font-bold text-white text-base">{q}</span>
        <ChevronDown
          size={18}
          className={`text-brand-yellow shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "200px" : "0px" }}
      >
        <p className="px-6 pb-5 text-white/55 text-sm font-inter leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div
      className="min-h-screen pt-24 pb-20 px-4 sm:px-6"
      style={{ backgroundColor: "#f5be4d" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-brand-purple-light font-inter font-semibold text-xs uppercase tracking-[0.2em]">
            FAQ
          </span>
          <h1 className="font-playfair font-bold text-5xl text-white mt-5 mb-4">
            Questions? <em className="text-gradient not-italic">Answered.</em>
          </h1>
          <p className="text-white/45 text-lg font-inter">
            Everything parents ask before their first order.
          </p>
        </div>

        <div className="space-y-3 mb-14">
          {faqs.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>

        {/* Still have questions */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(37,211,102,0.06) 0%, rgba(18,140,78,0.04) 100%)",
            border: "1px solid rgba(37,211,102,0.15)",
          }}
        >
          <div className="text-4xl mb-4">💬</div>
          <h2 className="font-playfair font-bold text-white text-xl mb-2">
            Still have a question?
          </h2>
          <p className="text-white/45 text-sm font-inter mb-5">
            Message us on WhatsApp — we reply within minutes.
          </p>
          <a
            href={whatsappGeneralLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-6 py-3 rounded-full text-sm transition-all font-inter"
          >
            Chat on WhatsApp
          </a>
        </div>

        <div className="text-center mt-8">
          <Link href="/shop" className="text-brand-yellow text-sm font-inter hover:underline">
            Browse all kits →
          </Link>
        </div>
      </div>
    </div>
  );
}
