export const revalidate = 60; // Revalidar cada 60 segundos

import { createClient } from "@/lib/supabase/server";
import HeroCarousel from "@/components/public/HeroCarousel";
import { BlogSection } from "@/components/ui/blog-section";
import TrendingSection from "@/components/public/TrendingSection";
import SidebarPublic from "@/components/public/SidebarPublic";
import AdBanner from "@/components/public/AdBanner";
import { readingTime } from "@/lib/utils";
import type { Ad } from "@/types";

interface HomeArticle {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
  category: { name: string; color: string; slug: string } | null;
}

interface BlogArticle {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
  author_name: string;
  content: string;
  category: { name: string; color: string; slug: string } | null;
}

interface PopularArticle {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
  category: { name: string; color: string } | null;
}

interface TrendingArticle {
  title: string;
  slug: string;
  image_url: string | null;
  category: { name: string; color: string } | null;
}

export default async function HomePage() {
  const supabase = createClient();

  // Noticias destacadas para el carrusel (hasta 5)
  const { data: featuredData } = await supabase
    .from("articles")
    .select("title, slug, excerpt, image_url, created_at, category:categories(name, color, slug)")
    .eq("published", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<HomeArticle[]>();

  let heroSlides = featuredData ?? [];

  // Si no hay destacadas, usar las 3 mas recientes
  if (heroSlides.length === 0) {
    const { data: latestData } = await supabase
      .from("articles")
      .select("title, slug, excerpt, image_url, created_at, category:categories(name, color, slug)")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .returns<HomeArticle[]>();

    heroSlides = latestData ?? [];
  }

  // Últimas noticias para la sección principal (blog grid)
  const { data: latestRaw } = await supabase
    .from("articles")
    .select("title, slug, excerpt, image_url, created_at, author_name, content, category:categories(name, color, slug)")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(12)
    .returns<BlogArticle[]>();

  // Calcular readingTime en servidor para no pasar content al cliente
  const latestArticles = (latestRaw ?? []).map(({ content, ...rest }) => ({
    ...rest,
    readTime: content ? readingTime(content) : null,
  }));

  // Mas leidas de la semana (via page_views últimos 7 días)
  const { data: popularIds } = await supabase.rpc("popular_articles_this_week", {
    lim: 5,
  });

  let popular: PopularArticle[] = [];
  if (popularIds && popularIds.length > 0) {
    const ids = popularIds.map((r: { article_id: string }) => r.article_id);
    const { data: popularData } = await supabase
      .from("articles")
      .select("id, title, slug, excerpt, image_url, created_at, category:categories(name, color)")
      .in("id", ids)
      .returns<(PopularArticle & { id: string })[]>();

    // Ordenar según el ranking de page_views
    const orderMap = new Map<string, number>(ids.map((id: string, i: number) => [id, i]));
    popular = (popularData ?? []).sort(
      (a, b) => (orderMap.get(a.id) ?? 99) - (orderMap.get(b.id) ?? 99)
    );
  }

  // Fallback: si no hay datos de la semana, usar vistas totales
  if (popular.length === 0) {
    const { data: fallbackData } = await supabase
      .from("articles")
      .select("title, slug, excerpt, image_url, created_at, category:categories(name, color)")
      .eq("published", true)
      .order("views", { ascending: false })
      .limit(5)
      .returns<PopularArticle[]>();
    popular = fallbackData ?? [];
  }

  // Trending últimas 24h
  const { data: trendingIds } = await supabase.rpc("trending_articles_24h", {
    lim: 5,
  });

  let trending: TrendingArticle[] = [];
  if (trendingIds && trendingIds.length > 0) {
    const tIds = trendingIds.map((r: { article_id: string }) => r.article_id);
    const { data: trendingData } = await supabase
      .from("articles")
      .select("id, title, slug, image_url, category:categories(name, color)")
      .in("id", tIds)
      .returns<(TrendingArticle & { id: string })[]>();

    const tOrderMap = new Map<string, number>(tIds.map((id: string, i: number) => [id, i]));
    trending = (trendingData ?? []).sort(
      (a, b) => (tOrderMap.get(a.id) ?? 99) - (tOrderMap.get(b.id) ?? 99)
    );
  }

  // Publicidad
  const { data: adsData } = await supabase
    .from("ads")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .returns<Ad[]>();

  const allAds = adsData ?? [];
  const headerAds = allAds.filter((a) => a.position === "header");
  const sidebarAds = allAds.filter((a) => a.position === "sidebar");
  const betweenAds = allAds.filter((a) => a.position === "between_articles");

  return (
    <div className="container-custom py-5 sm:py-8 space-y-8 sm:space-y-12">
      {/* Banner superior — publicidad */}
      {headerAds.map((ad) => (
        <AdBanner key={ad.id} ad={ad} />
      ))}

      {/* Hero Carousel */}
      {heroSlides.length > 0 && <HeroCarousel slides={heroSlides} />}

      {/* Trending */}
      {trending.length > 0 && <TrendingSection articles={trending} />}

      {/* Publicidad entre secciones */}
      {betweenAds[0] && (
        <div className="mb-2">
          <AdBanner ad={betweenAds[0]} />
        </div>
      )}

      {/* Sección principal — últimas noticias (blog grid) */}
      {(latestArticles ?? []).length > 0 && (
        <BlogSection articles={latestArticles ?? []} />
      )}

      {/* Publicidad + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
        <div className="lg:col-span-2">
          {betweenAds.slice(1).map((ad) => (
            <div key={ad.id} className="mb-8">
              <AdBanner ad={ad} />
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <SidebarPublic popular={popular} sidebarAds={sidebarAds} />
          </div>
        </div>
      </div>
    </div>
  );
}
