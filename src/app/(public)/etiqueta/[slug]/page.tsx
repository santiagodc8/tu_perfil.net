export const revalidate = 60;

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ArticleCard from "@/components/public/ArticleCard";
import Breadcrumbs from "@/components/public/Breadcrumbs";

const ARTICLES_PER_PAGE = 12;

interface TagArticle {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
  category: { name: string; color: string } | null;
}

interface TagArticleRow {
  article: TagArticle;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data: tag } = await supabase
    .from("tags")
    .select("name")
    .eq("slug", params.slug)
    .single();

  if (!tag) return { title: "Etiqueta no encontrada" };

  const description = `Noticias etiquetadas con "${tag.name}" en TuPerfil.net`;

  return {
    title: `#${tag.name}`,
    description,
    openGraph: {
      title: `#${tag.name} — TuPerfil.net`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `#${tag.name} — TuPerfil.net`,
      description,
    },
  };
}

export default async function EtiquetaPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: tag } = await supabase
    .from("tags")
    .select("id, name, slug")
    .eq("slug", params.slug)
    .single();

  if (!tag) notFound();

  // Fetch articles that have this tag, joining through article_tags
  const { data: rows, count } = await supabase
    .from("article_tags")
    .select(
      "article:articles(title, slug, excerpt, image_url, created_at, category:categories(name, color))",
      { count: "exact" }
    )
    .eq("tag_id", tag.id)
    .eq("article.published", true)
    .order("article_id", { ascending: false })
    .range(0, ARTICLES_PER_PAGE - 1)
    .returns<TagArticleRow[]>();

  // Filter out nulls (articles that didn't match published filter)
  const articles = (rows ?? [])
    .map((row) => row.article)
    .filter((a): a is TagArticle => a !== null);

  const total = count ?? 0;

  return (
    <div className="container-custom py-4 sm:py-6">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: `#${tag.name}` }]} />
      </div>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          <span className="w-1 sm:w-1.5 h-6 sm:h-8 rounded-full bg-primary" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-heading">
            #{tag.name}
          </h1>
        </div>
        <p className="text-muted text-sm sm:text-base">
          {total} {total === 1 ? "noticia" : "noticias"}
        </p>
      </div>

      {/* Articles */}
      {articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {articles.map((article) => (
              <ArticleCard
                key={article.slug}
                {...article}
                category={article.category ?? null}
              />
            ))}
          </div>
          {total > ARTICLES_PER_PAGE && (
            <p className="text-center text-sm text-muted mt-8">
              Mostrando {articles.length} de {total} noticias
            </p>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-muted">
          No hay noticias con esta etiqueta todavía.
        </div>
      )}

      {/* Back link */}
      <div className="mt-10 text-center">
        <Link
          href="/"
          className="text-sm text-muted hover:text-primary transition"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
