import { createClient } from "@/lib/supabase/server";
import HeroArticle from "@/components/public/HeroArticle";
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

  // Noticia mas reciente para el hero
  const { data: heroData } = await supabase
    .from("articles")
    .select("title, slug, excerpt, image_url, created_at, category:categories(name, color, slug)")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .returns<HomeArticle[]>();

  const hero = heroData?.[0] ?? null;

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
    <div className="container-custom py-6 space-y-10">
      {/* Hero */}
      {hero && <HeroArticle {...hero} />}

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-10">
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
          <div className="sticky top-6">
            <SidebarPublic popular={popular} />
          </div>
        </div>
      </div>
    </div>
  );
}
