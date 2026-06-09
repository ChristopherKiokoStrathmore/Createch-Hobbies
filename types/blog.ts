export interface WPAuthor {
  id: number;
  name: string;
  description: string;
  avatar_urls: Record<string, string>;
}

export interface WPTerm {
  id: number;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  coverImage: string;
  coverAlt: string;
  categories: WPTerm[];
  tags: WPTerm[];
  author: WPAuthor;
  readingTime: number;
}
