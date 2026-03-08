export const revalidate = 60;

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import LoadMoreArticles from "@/components/public/LoadMoreArticles";

const ARTICLES_PER_PAGE = 12;

interface CategoryArticle {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
}

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("slug", params.category)
    .single();

  if (!category) return { title: "Categoría no encontrada" };

  return {
    title: category.name,
    description: `Noticias de ${category.name} en TuPerfil.net`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const supabase = createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", params.category)
    .single();

  if (!category) notFound();

  const { data: articles, count } = await supabase
    .from("articles")
    .select("title, slug, excerpt, image_url, created_at", { count: "exact" })
    .eq("published", true)
    .eq("category_id", category.id)
    .order("created_at", { ascending: false })
    .range(0, ARTICLES_PER_PAGE - 1)
    .returns<CategoryArticle[]>();

  const total = count ?? 0;

  return (
    <div className="container-custom py-4 sm:py-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          <span
            className="w-1 sm:w-1.5 h-6 sm:h-8 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-heading">
            {category.name}
          </h1>
        </div>
        <p className="text-muted text-sm sm:text-base">
          {total} {total === 1 ? "noticia" : "noticias"}
        </p>
      </div>

      {/* Articles */}
      {articles && articles.length > 0 ? (
        <LoadMoreArticles
          initialArticles={articles}
          categoryId={category.id}
          categoryName={category.name}
          categoryColor={category.color}
          total={total}
        />
      ) : (
        <div className="text-center py-16 text-muted">
          No hay noticias en esta categoría todavía.
        </div>
      )}
    </div>
  );
}
