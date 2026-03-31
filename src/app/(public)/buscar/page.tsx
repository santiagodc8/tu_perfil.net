import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ArticleCard from "@/components/public/ArticleCard";
import Breadcrumbs from "@/components/public/Breadcrumbs";
import type { Category } from "@/types";

interface SearchArticle {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
  views: number;
  category: { name: string; color: string } | null;
}

export const metadata: Metadata = {
  title: "Buscar",
  description: "Buscar noticias en TuPerfil.net",
};

type SortOption = "recent" | "oldest" | "popular";

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: { q?: string; cat?: string; sort?: string };
}) {
  const query = searchParams.q?.trim() ?? "";
  const catFilter = searchParams.cat ?? "";
  const sortBy = (searchParams.sort ?? "recent") as SortOption;

  const supabase = createClient();

  // Categorías para el filtro
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  const categories: Category[] = (categoriesData as Category[]) ?? [];

  let articles: SearchArticle[] = [];

  if (query) {
    let qb = supabase
      .from("articles")
      .select(
        "title, slug, excerpt, image_url, created_at, views, category:categories(name, color)"
      )
      .eq("published", true)
      .or(
        `title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`
      );

    if (catFilter) {
      // Buscar el id de la categoría por slug
      const cat = categories.find((c) => c.slug === catFilter);
      if (cat) {
        qb = qb.eq("category_id", cat.id);
      }
    }

    if (sortBy === "popular") {
      qb = qb.order("views", { ascending: false });
    } else if (sortBy === "oldest") {
      qb = qb.order("created_at", { ascending: true });
    } else {
      qb = qb.order("created_at", { ascending: false });
    }

    const { data } = await qb.limit(30).returns<SearchArticle[]>();
    articles = data ?? [];
  }

  const sortLabels: Record<SortOption, string> = {
    recent: "Más recientes",
    oldest: "Más antiguas",
    popular: "Más leídas",
  };

  return (
    <div className="container-custom py-4 sm:py-6">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Búsqueda" }]} />
      </div>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-heading mb-4">
          Buscar noticias
        </h1>

        <form action="/buscar" className="space-y-3">
          <div className="flex max-w-lg">
            <input
              name="q"
              type="text"
              defaultValue={query}
              placeholder="Escribe tu búsqueda..."
              className="flex-1 min-w-0 px-4 py-3 border border-surface-border rounded-l-lg text-sm bg-surface-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="submit"
              className="px-5 sm:px-6 py-3 bg-primary text-white font-semibold rounded-r-lg hover:bg-primary-hover active:bg-primary-dark transition"
            >
              Buscar
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3">
            <select
              name="cat"
              defaultValue={catFilter}
              className="px-3 py-2 border border-surface-border rounded-lg text-sm bg-surface-card text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              name="sort"
              defaultValue={sortBy}
              className="px-3 py-2 border border-surface-border rounded-lg text-sm bg-surface-card text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                <option key={key} value={key}>
                  {sortLabels[key]}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {query && (
        <p className="text-muted mb-6 text-sm sm:text-base">
          {articles.length} {articles.length === 1 ? "resultado" : "resultados"}{" "}
          para{" "}
          <span className="font-semibold text-heading">
            &ldquo;{query}&rdquo;
          </span>
          {catFilter && (
            <>
              {" "}
              en{" "}
              <span className="font-semibold text-heading">
                {categories.find((c) => c.slug === catFilter)?.name ?? catFilter}
              </span>
            </>
          )}
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
