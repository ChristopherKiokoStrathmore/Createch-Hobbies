import type { Metadata } from "next";
import Link from "next/link";
import { getPosts, getCategories } from "@/lib/wordpress";
import FeaturedPost from "@/components/blog/FeaturedPost";
import PostCard from "@/components/blog/PostCard";
import CategoryTabs from "@/components/blog/CategoryTabs";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog | Createch Hobbies",
  description:
    "Building tips, kit spotlights, STEM stories, and inspiration for young makers from Createch Hobbies.",
};

interface Props {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const { category, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  const [categories, postsResult] = await Promise.all([
    getCategories(),
    (async () => {
      const catId = category
        ? (await getCategories()).find(c => c.slug === category)?.id
        : undefined;
      return getPosts({ page, perPage: 9, categoryId: catId });
    })(),
  ]);

  const { posts, totalPages } = postsResult;

  const showFeatured = page === 1 && !category && posts.length > 0;
  const featured = showFeatured ? posts[0] : null;
  const grid = showFeatured ? posts.slice(1) : posts;

  function buildPageUrl(n: number): string {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (n > 1) params.set("page", String(n));
    const qs = params.toString();
    return `/blog${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-brand-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-12">
          <span className="text-brand-purple font-inter font-semibold text-xs uppercase tracking-[0.2em]">
            Createch Blog
          </span>
          <h1 className="font-playfair font-bold text-4xl sm:text-5xl text-white mt-4 mb-4">
            Ideas, Guides &{" "}
            <em className="not-italic text-brand-yellow">STEM Stories</em>
          </h1>
          <p className="text-white/50 text-lg font-inter max-w-xl mx-auto leading-relaxed">
            Building tips, kit spotlights, and inspiration for young makers.
          </p>
        </div>

        <CategoryTabs categories={categories} activeSlug={category} />

        {featured && <FeaturedPost post={featured} />}

        {grid.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {grid.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-white/30 font-inter">
            {category ? "No posts in this category yet." : "No posts published yet."}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12 flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <Link
                key={n}
                href={buildPageUrl(n)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-inter text-sm transition-all ${
                  n === page
                    ? "bg-brand-yellow text-brand-dark font-semibold"
                    : "text-white/40 hover:text-white border border-white/10 hover:border-white/30"
                }`}
              >
                {n}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
