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
  featured: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  author_id: string;
  // Joined
  category?: Category;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}
