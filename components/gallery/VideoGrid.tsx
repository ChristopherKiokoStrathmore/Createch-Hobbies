"use client";

import { useState } from "react";
import VideoCard from "./VideoCard";
import type { GalleryVideo } from "@/lib/gallery-videos";

interface Props {
  videos: GalleryVideo[];
}

export default function VideoGrid({ videos }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {videos.map((v) => (
        <VideoCard
          key={v.id}
          id={v.id}
          src={`/videos/${v.filename}`}
          poster={`/videos/posters/${v.filename.replace(/\.mp4$/, ".jpg")}`}
          activeId={activeId}
          onActivate={setActiveId}
        />
      ))}
    </div>
  );
}
