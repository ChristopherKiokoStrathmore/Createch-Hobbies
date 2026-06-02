import HeroVideo from "@/components/home/HeroVideo";
import TrustBar from "@/components/home/TrustBar";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import WhyCreatech from "@/components/home/WhyCreatech";
import OurCommunity from "@/components/home/OurCommunity";
import Testimonials from "@/components/home/Testimonials";
import WhatsAppCTA from "@/components/home/WhatsAppCTA";

export default function HomePage() {
  return (
    <>
      {/*
       * HeroVideo is position:sticky / z-0 — it pins behind everything below.
       * The video keeps playing as the user scrolls the content over it.
       */}
      <HeroVideo />

      {/*
       * All content sits on top of the sticky hero (z-10).
       * Section backgrounds are solid dark so the video is revealed only
       * through the hero viewport before content covers it.
       */}
      <div className="relative z-10">
        <TrustBar />
        <HowItWorks />
        <FeaturedProducts />
        <CategoryShowcase />
        <WhyCreatech />
        <OurCommunity />
        <Testimonials />
        <WhatsAppCTA />
      </div>
    </>
  );
}
