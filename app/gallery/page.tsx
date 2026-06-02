import { galleryVideos } from "@/lib/gallery-videos";
import GalleryGrid from "@/components/gallery/GalleryGrid";

export const metadata = {
  title: "Our Community | Createch Hobbies",
  description: "Watch our community build, learn, and play with Createch DIY kits.",
};

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-brand-dark pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full border border-brand-yellow/30 text-brand-yellow text-xs font-inter tracking-widest uppercase mb-4">
            Our Community
          </span>
          <h1 className="font-playfair text-3xl sm:text-5xl font-bold text-white mb-4">
            Real Builds. Real Kids.{" "}
            <span className="text-brand-yellow italic">Real Fun.</span>
          </h1>
          <p className="text-white/60 font-inter text-sm sm:text-base max-w-xl mx-auto">
            Watch our community in action — kits being assembled, tested, and
            celebrated at events across Kenya.
          </p>
        </div>

        {/* Tap-for-sound hint */}
        <p className="text-center text-white/30 text-xs font-inter mb-6 sm:mb-10">
          Tap any clip to watch · Use arrows or keyboard to navigate
        </p>

        <GalleryGrid videos={galleryVideos} />
      </div>
    </main>
  );
}
