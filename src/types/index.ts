export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string | null;
  category_id: string;
  published: boolean;
  published_at: string | null;
  featured: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  author_id: string;
  author_name: string;
  deleted_at: string | null;
  gallery: string[];
  audio_url: string | null;
  video_url: string | null;
  // Joined
  category?: Category;
  tags?: Tag[];
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ArticleTag {
  article_id: string;
  tag_id: string;
}

export interface BreakingNews {
  id: string;
  text: string;
  link: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  article_id: string;
  author_name: string;
  author_email: string;
  content: string;
  approved: boolean;
  created_at: string;
  // Joined
  article?: { title: string; slug: string };
}

export interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  active: boolean;
  created_at: string;
  unsubscribed_at: string | null;
}

export type UserRole = 'admin' | 'editor';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type ReferrerSource = 'direct' | 'google' | 'facebook' | 'twitter' | 'whatsapp' | 'other';

export interface PageView {
  id: string;
  article_id: string;
  viewed_at: string;
  referrer: string | null;
  referrer_source: ReferrerSource | null;
}

export type AdPosition = 'sidebar' | 'header' | 'between_articles';

export interface Ad {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  position: AdPosition;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
