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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {articles.map((article) => (
          <ArticleCard
            key={article.slug}
            {...article}
            category={{ name: categoryName, color: categoryColor }}
          />
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-surface-card border-2 border-surface-border text-body font-semibold rounded-xl hover:border-primary hover:text-primary transition disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Cargar más noticias"}
          </button>
        </div>
      )}
    </>
  );
}
