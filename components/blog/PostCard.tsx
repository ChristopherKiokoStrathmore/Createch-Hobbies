import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/types/blog";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="section-card rounded-2xl overflow-hidden border border-white/5 hover:border-brand-yellow/20 transition-all duration-300 h-full flex flex-col">
        <div className="aspect-video relative bg-black/20 overflow-hidden flex-shrink-0">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.coverAlt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/20 to-brand-yellow/10 flex items-center justify-center">
              <span className="font-playfair text-white/15 text-5xl font-bold">C</span>
            </div>
          )}
          {post.categories[0] && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-brand-yellow text-brand-dark text-xs font-semibold font-inter">
              {post.categories[0].name}
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col p-5">
          <h3 className="font-playfair font-bold text-white text-lg leading-snug mb-2 group-hover:text-brand-yellow transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-white/45 text-sm leading-relaxed font-inter line-clamp-2 flex-1">
            {post.excerpt}
          </p>
          <div className="mt-4 flex items-center gap-3 text-white/30 text-xs font-inter">
            <span>{formatDate(post.date)}</span>
            <span>·</span>
            <span>{post.readingTime} min read</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
