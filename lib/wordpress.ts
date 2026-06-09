import type { BlogPost, WPTerm } from "@/types/blog";

const WP_BASE = (process.env.WOO_URL ?? "").replace(/\/$/, "") + "/wp-json/wp/v2";

// ── Raw API types ─────────────────────────────────────────────────────────────

interface WPPostRaw {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  _embedded?: {
    author?: Array<{
      id: number;
      name: string;
      description: string;
      avatar_urls: Record<string, string>;
    }>;
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    "wp:term"?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function calcReadingTime(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function mapPost(p: WPPostRaw): BlogPost {
  const emb = p._embedded ?? {};
  const author = emb.author?.[0];
  const media = emb["wp:featuredmedia"]?.[0];
  const terms = emb["wp:term"] ?? [];
  return {
    id: p.id,
    slug: p.slug,
    title: stripHtml(p.title.rendered),
    excerpt: stripHtml(p.excerpt.rendered),
    content: p.content.rendered,
    date: p.date,
    coverImage: media?.source_url ?? "",
    coverAlt: media?.alt_text ?? stripHtml(p.title.rendered),
    categories: (terms[0] ?? []).map(t => ({ id: t.id, name: t.name, slug: t.slug })),
    tags: (terms[1] ?? []).map(t => ({ id: t.id, name: t.name, slug: t.slug })),
    author: {
      id: author?.id ?? 0,
      name: author?.name ?? "Createch Hobbies",
      description: author?.description ?? "",
      avatar_urls: author?.avatar_urls ?? {},
    },
    readingTime: calcReadingTime(p.content.rendered),
  };
}

function buildUrl(path: string, params: Record<string, string>): string {
  const url = new URL(`${WP_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface GetPostsResult {
  posts: BlogPost[];
  total: number;
  totalPages: number;
}

export async function getPosts(opts: {
  page?: number;
  perPage?: number;
  categoryId?: number;
  search?: string;
} = {}): Promise<GetPostsResult> {
  const params: Record<string, string> = {
    _embed: "1",
    per_page: String(opts.perPage ?? 9),
    page: String(opts.page ?? 1),
    status: "publish",
    orderby: "date",
    order: "desc",
  };
  if (opts.categoryId) params.categories = String(opts.categoryId);
  if (opts.search) params.search = opts.search;

  try {
    const res = await fetch(buildUrl("/posts", params), { next: { revalidate: 300 } });
    if (!res.ok) return { posts: [], total: 0, totalPages: 0 };
    const data = (await res.json()) as WPPostRaw[];
    return {
      posts: data.map(mapPost),
      total: parseInt(res.headers.get("X-WP-Total") ?? "0", 10),
      totalPages: parseInt(res.headers.get("X-WP-TotalPages") ?? "0", 10),
    };
  } catch {
    return { posts: [], total: 0, totalPages: 0 };
  }
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(
      buildUrl("/posts", { slug, _embed: "1", status: "publish" }),
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as WPPostRaw[];
    return data.length ? mapPost(data[0]) : null;
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<WPTerm[]> {
  try {
    const res = await fetch(
      buildUrl("/categories", { per_page: "50", hide_empty: "true" }),
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    return res.json() as Promise<WPTerm[]>;
  } catch {
    return [];
  }
}

export async function getRelatedPosts(categoryId: number, excludeId: number): Promise<BlogPost[]> {
  const { posts } = await getPosts({ categoryId, perPage: 4 });
  return posts.filter(p => p.id !== excludeId).slice(0, 3);
}
