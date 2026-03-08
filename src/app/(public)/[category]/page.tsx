export const revalidate = 60;

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ArticleCard from "@/components/public/ArticleCard";
import Pagination from "@/components/public/Pagination";

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
  searchParams,
}: {
  params: { category: string };
  searchParams: { pagina?: string };
}) {
  const supabase = createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", params.category)
    .single();

  if (!category) notFound();

  const currentPage = Math.max(1, parseInt(searchParams.pagina ?? "1"));
  const from = (currentPage - 1) * ARTICLES_PER_PAGE;
  const to = from + ARTICLES_PER_PAGE - 1;

  const { data: articles, count } = await supabase
    .from("articles")
    .select("title, slug, excerpt, image_url, created_at", { count: "exact" })
    .eq("published", true)
    .eq("category_id", category.id)
    .order("created_at", { ascending: false })
    .range(from, to)
    .returns<CategoryArticle[]>();

  const totalPages = Math.ceil((count ?? 0) / ARTICLES_PER_PAGE);

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
          {count ?? 0} {(count ?? 0) === 1 ? "noticia" : "noticias"}
        </p>
      </div>

      {/* Articles grid */}
      {articles && articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {articles.map((article) => (
              <ArticleCard
                key={article.slug}
                {...article}
                category={{ name: category.name, color: category.color }}
              />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/${category.slug}`}
          />
        </>
      ) : (
        <div className="text-center py-16 text-muted">
          No hay noticias en esta categoría todavía.
        </div>
      )}
    </div>
  );
}
