"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ArticleCard from "./ArticleCard";

const PAGE_SIZE = 12;

interface Article {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
}

interface LoadMoreArticlesProps {
  initialArticles: Article[];
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  total: number;
}

export default function LoadMoreArticles({
  initialArticles,
  categoryId,
  categoryName,
  categoryColor,
  total,
}: LoadMoreArticlesProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const hasMore = articles.length < total;

  async function loadMore() {
    setLoading(true);
    const from = articles.length;
    const to = from + PAGE_SIZE - 1;

    const { data } = await supabase
      .from("articles")
      .select("title, slug, excerpt, image_url, created_at")
      .eq("published", true)
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (data) {
      setArticles((prev) => [...prev, ...data]);
    }
    setLoading(false);
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 stagger-children">
        {articles.map((article, i) => (
          <ArticleCard
            key={article.slug}
            {...article}
            category={{ name: categoryName, color: categoryColor }}
            size={i === 0 ? "featured" : "default"}
          />
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3 bg-surface-card border-2 border-surface-border text-body font-semibold rounded-xl hover:border-primary hover:text-primary transition-all hover:shadow-card-hover disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Cargando...
              </>
            ) : (
              <>
                Cargar más noticias
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
