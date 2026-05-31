const pillars = [
  { icon: "🔩", title: "Snap-Fit Assembly",   sub: "No glue, no tools needed"         },
  { icon: "🚚", title: "Nairobi Delivery",     sub: "Usually 1–2 business days"        },
  { icon: "💬", title: "WhatsApp Support",     sub: "We reply within minutes"          },
  { icon: "💸", title: "From KES 850",         sub: "Affordable STEM for every family" },
];

export default function TrustBar() {
  return (
    <div
      className="border-y"
      style={{
        background:
          "linear-gradient(90deg, rgba(117,67,152,0.10) 0%, rgba(245,190,77,0.06) 50%, rgba(117,67,152,0.10) 100%)",
        borderColor: "rgba(245,190,77,0.12)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-brand-yellow/10">
          {pillars.map((p) => (
            <div key={p.title} className="flex items-center gap-3 py-4 px-4 sm:px-6">
              <span className="text-2xl shrink-0">{p.icon}</span>
              <div>
                <div className="text-white/85 font-semibold text-sm font-inter leading-tight">
                  {p.title}
                </div>
                <div className="text-white/35 text-xs font-inter mt-0.5">{p.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
