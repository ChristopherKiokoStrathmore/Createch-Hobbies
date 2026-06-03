import Link from "next/link";
import { whatsappGeneralLink } from "@/lib/whatsapp";

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 bg-brand-dark">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-24">
          <span className="text-brand-purple-light font-inter font-semibold text-xs uppercase tracking-[0.2em]">
            Our Story
          </span>
          <h1 className="font-playfair font-bold text-5xl md:text-6xl text-white mt-5 mb-6 leading-tight">
            We Believe Every Child is a{" "}
            <em className="text-gradient not-italic">Born Engineer</em>
          </h1>
          <p className="text-white/50 text-xl leading-relaxed font-inter max-w-2xl mx-auto">
            Createch Hobbies was born in Nairobi with a simple mission: make quality STEM education accessible, affordable, and insanely fun for every Kenyan child.
          </p>
        </div>

        {/* Values grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-24">
          {[
            {
              emoji: "🎯",
              title: "Our Mission",
              body: "To turn screen time into build time. We want every child to experience the pride of creating something with their own hands, and learning why it works.",
            },
            {
              emoji: "🌍",
              title: "Nairobi Roots",
              body: "We're proudly based in Nairobi, Kenya. Every kit is carefully curated and quality-checked to make sure your child gets the best experience possible.",
            },
            {
              emoji: "📚",
              title: "STEM First",
              body: "Every kit is selected because it teaches real engineering, physics, or science. Fun is the vehicle; learning is the destination.",
            },
            {
              emoji: "💚",
              title: "Affordable Access",
              body: "Great education shouldn't cost a fortune. We've priced our kits to be accessible to as many families as possible, starting from just KES 400.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="section-card rounded-2xl p-8 border border-white/5 hover:border-brand-yellow/15 transition-colors"
            >
              <div className="text-4xl mb-5">{item.emoji}</div>
              <h3 className="font-playfair font-bold text-white text-xl mb-3">{item.title}</h3>
              <p className="text-white/45 leading-relaxed font-inter text-sm">{item.body}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="font-playfair font-bold text-3xl text-white mb-6">
            Ready to build something?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop" className="btn-yellow px-8 py-4 rounded-full">
              Browse All Kits
            </Link>
            <a
              href={whatsappGeneralLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/15 hover:border-brand-dark/40 text-white/70 hover:text-brand-dark font-semibold px-8 py-4 rounded-full transition-all font-inter text-sm"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
