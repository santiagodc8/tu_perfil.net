export const revalidate = 60;

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import LoadMoreArticles from "@/components/public/LoadMoreArticles";
import Breadcrumbs from "@/components/public/Breadcrumbs";

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

  const description = `Noticias de ${category.name} en TuPerfil.net`;

  return {
    title: category.name,
    description,
    openGraph: {
      title: category.name,
      description,
      // og:image es generada automáticamente por opengraph-image.tsx
    },
    twitter: {
      card: "summary_large_image",
      title: category.name,
      description,
      // twitter:image es generada automáticamente por opengraph-image.tsx
    },
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
    <div className="container-custom py-5 sm:py-8">
      {/* Decorative category gradient */}
      <div
        className="h-1 rounded-full mb-6 sm:mb-8 opacity-20"
        style={{ background: `linear-gradient(to right, ${category.color}, transparent)` }}
      />

      <div className="mb-4 sm:mb-5">
        <Breadcrumbs items={[{ label: category.name }]} />
      </div>

      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
          <span
            className="w-1.5 h-8 sm:h-10 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <h1 className="font-display text-display-md sm:text-display-lg md:text-display-xl text-heading tracking-tight">
            {category.name}
          </h1>
        </div>
        <span className="inline-block bg-surface-card border border-surface-border rounded-full px-3.5 py-1 text-xs font-medium text-muted">
          {total} {total === 1 ? "noticia" : "noticias"}
        </span>
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
