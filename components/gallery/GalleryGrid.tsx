"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ThumbnailCard from "./ThumbnailCard";
import VideoModal from "./VideoModal";
import type { GalleryVideo } from "@/lib/gallery-videos";

const PER_PAGE = 12;

interface Props {
  videos: GalleryVideo[];
}

export default function GalleryGrid({ videos }: Props) {
  const [page,         setPage]         = useState(0);
  const [modalIndex,   setModalIndex]   = useState<number | null>(null);

  const totalPages = Math.ceil(videos.length / PER_PAGE);
  const pageVideos = videos.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const pageOffset = page * PER_PAGE;

  const openModal = useCallback((localIndex: number) => {
    setModalIndex(pageOffset + localIndex);
  }, [pageOffset]);

  const navigate = useCallback((globalIndex: number) => {
    setModalIndex(globalIndex);
    // Keep the paginator in sync so closing lands on the right page
    setPage(Math.floor(globalIndex / PER_PAGE));
  }, []);

  const goTo = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {pageVideos.map((v, i) => (
          <ThumbnailCard
            key={v.id}
            video={v}
            index={i}
            onClick={openModal}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10 sm:mt-14">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-white/15 text-white/50 hover:border-brand-yellow/50 hover:text-brand-yellow disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-8 h-8 rounded-full text-xs font-inter font-medium transition-all
                  ${i === page
                    ? "bg-brand-yellow text-brand-dark"
                    : "border border-white/15 text-white/50 hover:border-brand-yellow/40 hover:text-brand-yellow"
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages - 1}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-white/15 text-white/50 hover:border-brand-yellow/50 hover:text-brand-yellow disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Modal */}
      {modalIndex !== null && (
        <VideoModal
          videos={videos}
          index={modalIndex}
          onClose={() => setModalIndex(null)}
          onNavigate={navigate}
        />
      )}
    </>
  );
}
