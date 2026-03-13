export const revalidate = 60;

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ArticleCard from "@/components/public/ArticleCard";
import Breadcrumbs from "@/components/public/Breadcrumbs";
import { generateSlug } from "@/lib/utils";

interface AuthorArticle {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
  category: { name: string; color: string } | null;
}

function authorNameFromSlug(slug: string): string {
  return decodeURIComponent(slug).replace(/-/g, " ");
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const name = authorNameFromSlug(params.slug);
  const supabase = createClient();

  // Verificar que existe al menos un artículo con este autor
  const { count } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("published", true)
    .ilike("author_name", name);

  if (!count || count === 0) return { title: "Autor no encontrado" };

  const description = `Noticias escritas por ${name} en TuPerfil.net`;

  return {
    title: `${name} — Autor`,
    description,
    openGraph: {
      title: `${name} — TuPerfil.net`,
      description,
    },
  };
}

export default async function AutorPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const name = authorNameFromSlug(params.slug);

  // Buscar artículos de este autor (case-insensitive)
  const { data: articles, count } = await supabase
    .from("articles")
    .select(
      "title, slug, excerpt, image_url, created_at, category:categories(name, color)",
      { count: "exact" }
    )
    .eq("published", true)
    .ilike("author_name", name)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<AuthorArticle[]>();

  const total = count ?? 0;

  if (total === 0) notFound();

  // Obtener el nombre exacto del primer artículo (para capitalización correcta)
  const { data: firstArticle } = await supabase
    .from("articles")
    .select("author_name")
    .eq("published", true)
    .ilike("author_name", name)
    .limit(1)
    .single();

  const displayName = firstArticle?.author_name ?? name;

  return (
    <div className="container-custom py-4 sm:py-6">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: displayName }]} />
      </div>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          <span className="w-1 sm:w-1.5 h-6 sm:h-8 rounded-full bg-primary" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-heading">
            {displayName}
          </h1>
        </div>
        <p className="text-muted text-sm sm:text-base">
          {total} {total === 1 ? "noticia publicada" : "noticias publicadas"}
        </p>
      </div>

      {/* Articles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {(articles ?? []).map((article) => (
          <ArticleCard
            key={article.slug}
            {...article}
            category={article.category ?? null}
          />
        ))}
      </div>

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
