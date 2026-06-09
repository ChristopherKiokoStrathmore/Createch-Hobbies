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

export default function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block mb-8">
      <article className="section-card rounded-2xl overflow-hidden border border-white/5 hover:border-brand-yellow/20 transition-all duration-300 sm:flex">
        <div className="relative sm:w-1/2 aspect-video sm:aspect-auto overflow-hidden flex-shrink-0">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.coverAlt}
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/30 to-brand-yellow/15 flex items-center justify-center min-h-[240px]">
              <span className="font-playfair text-white/15 text-7xl font-bold">C</span>
            </div>
          )}
          {post.categories[0] && (
            <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-brand-yellow text-brand-dark text-xs font-semibold font-inter">
              {post.categories[0].name}
            </span>
          )}
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-10 sm:w-1/2">
          <span className="text-brand-yellow font-inter text-xs font-semibold uppercase tracking-widest mb-4">
            Featured Post
          </span>
          <h2 className="font-playfair font-bold text-white text-2xl sm:text-3xl leading-tight mb-4 group-hover:text-brand-yellow transition-colors line-clamp-3">
            {post.title}
          </h2>
          <p className="text-white/45 font-inter text-sm leading-relaxed line-clamp-3 mb-6">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-4 text-white/30 text-xs font-inter">
            <div className="flex items-center gap-2">
              {post.author.avatar_urls?.["48"] && (
                <Image
                  src={post.author.avatar_urls["48"]}
                  alt={post.author.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span>{post.author.name}</span>
            </div>
            <span>·</span>
            <span>{formatDate(post.date)}</span>
            <span>·</span>
            <span>{post.readingTime} min read</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
