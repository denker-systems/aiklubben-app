export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: 'user' | 'admin';
  avatar_url: string | null;
  membership_type: string | null;
  created_at: string;
}

export interface NewsSource {
  name: string;
  url: string;
  title?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  image_url: string | null;
  published_at: string | null;
  slug: string;
  sources?: NewsSource[] | null;
}

export interface ContentItem {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  category: string;
  slug: string;
}
