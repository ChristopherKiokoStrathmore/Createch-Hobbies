import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPost, getRelatedPosts } from "@/lib/wordpress";
import PostContent from "@/components/blog/PostContent";
import ReadingProgress from "@/components/blog/ReadingProgress";
import ShareButtons from "@/components/blog/ShareButtons";
import PostCard from "@/components/blog/PostCard";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Createch Hobbies Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author.name],
      ...(post.coverImage ? { images: [{ url: post.coverImage, alt: post.coverAlt }] } : {}),
    },
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = post.categories[0]
    ? await getRelatedPosts(post.categories[0].id, post.id)
    : [];

  const canonicalUrl = `https://createch-hobbies.co.ke/blog/${post.slug}`;

  return (
    <>
      <ReadingProgress />

      <div className="min-h-screen bg-brand-dark">

        {/* Cover image */}
        {post.coverImage && (
          <div className="relative h-[45vh] sm:h-[55vh] w-full overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.coverAlt}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent" />
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Article header */}
          <header className={`${post.coverImage ? "-mt-24 relative" : "pt-28"} pb-8 border-b border-white/8`}>
            {post.categories[0] && (
              <Link
                href={`/blog?category=${post.categories[0].slug}`}
                className="inline-block mb-4 px-3 py-1 rounded-full bg-brand-yellow text-brand-dark text-xs font-semibold font-inter"
              >
                {post.categories[0].name}
              </Link>
            )}

            <h1 className="font-playfair font-bold text-white text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-white/40 text-sm font-inter">
              <div className="flex items-center gap-2.5">
                {post.author.avatar_urls?.["48"] && (
                  <Image
                    src={post.author.avatar_urls["48"]}
                    alt={post.author.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span className="text-white/60">{post.author.name}</span>
              </div>
              <span>·</span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>·</span>
              <span>{post.readingTime} min read</span>
            </div>
          </header>

          {/* Article body */}
          <div className="py-10">
            <PostContent html={post.content} />
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map(tag => (
                <span
                  key={tag.id}
                  className="px-3 py-1 rounded-full border border-white/10 text-white/35 text-xs font-inter"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Share + back */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-t border-white/8 mb-16">
            <ShareButtons title={post.title} url={canonicalUrl} />
            <Link
              href="/blog"
              className="text-white/35 hover:text-white font-inter text-sm transition-colors"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="border-t border-white/5 bg-black/10 py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <h2 className="font-playfair font-bold text-white text-2xl mb-8 text-center">
                You Might Also Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map(p => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
