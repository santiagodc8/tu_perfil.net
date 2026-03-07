import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ArticleCard from "@/components/public/ArticleCard";

interface SearchArticle {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
  category: { name: string; color: string } | null;
}

export const metadata: Metadata = {
  title: "Buscar",
  description: "Buscar noticias en TuPerfil.net",
};

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim() ?? "";
  let articles: SearchArticle[] = [];

  if (query) {
    const supabase = createClient();
    const { data } = await supabase
      .from("articles")
      .select("title, slug, excerpt, image_url, created_at, category:categories(name, color)")
      .eq("published", true)
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .limit(20)
      .returns<SearchArticle[]>();

    articles = data ?? [];
  }

  return (
    <div className="container-custom py-4 sm:py-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-heading mb-4">
          Buscar noticias
        </h1>

        <form action="/buscar" className="flex max-w-lg">
          <input
            name="q"
            type="text"
            defaultValue={query}
            placeholder="Escribe tu búsqueda..."
            className="flex-1 px-4 py-3 border border-surface-border rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="submit"
            className="px-5 sm:px-6 py-3 bg-primary text-white font-semibold rounded-r-lg hover:bg-primary-hover active:bg-primary-dark transition"
          >
            Buscar
          </button>
        </form>
      </div>

      {query && (
        <p className="text-muted mb-6 text-sm sm:text-base">
          {articles.length} {articles.length === 1 ? "resultado" : "resultados"}{" "}
          para <span className="font-semibold text-heading">&ldquo;{query}&rdquo;</span>
        </p>
      )}

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.slug} {...article} />
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-16 text-muted">
          No se encontraron noticias para esta búsqueda.
        </div>
      ) : null}
    </div>
  );
}
