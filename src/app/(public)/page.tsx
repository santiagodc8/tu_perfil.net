import { createClient } from "@/lib/supabase/server";
import HeroCarousel from "@/components/public/HeroCarousel";
import CategorySection from "@/components/public/CategorySection";
import SidebarPublic from "@/components/public/SidebarPublic";
import type { Category } from "@/types";

interface HomeArticle {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
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

  // Categorias con sus noticias recientes (hasta 3 por categoria)
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  const cats: Category[] = categories ?? [];

  const categoryArticles = await Promise.all(
    cats.map(async (cat) => {
      const { data } = await supabase
        .from("articles")
        .select("title, slug, excerpt, image_url, created_at")
        .eq("published", true)
        .eq("category_id", cat.id)
        .order("created_at", { ascending: false })
        .limit(3);

      return { ...cat, articles: data ?? [] };
    })
  );

  // Mas leidas
  const { data: popularData } = await supabase
    .from("articles")
    .select("title, slug, excerpt, image_url, created_at, category:categories(name, color)")
    .eq("published", true)
    .order("views", { ascending: false })
    .limit(5)
    .returns<PopularArticle[]>();

  const popular = popularData ?? [];

  return (
    <div className="container-custom py-4 sm:py-6 space-y-6 sm:space-y-10">
      {/* Hero Carousel */}
      {heroSlides.length > 0 && <HeroCarousel slides={heroSlides} />}

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8 sm:space-y-10">
          {categoryArticles.map((cat) => (
            <CategorySection
              key={cat.id}
              name={cat.name}
              slug={cat.slug}
              color={cat.color}
              articles={cat.articles}
            />
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-16">
            <SidebarPublic popular={popular} />
          </div>
        </div>
      </div>
    </div>
  );
}
