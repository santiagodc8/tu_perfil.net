import ArticleCard from "./ArticleCard";
import AdBanner from "./AdBanner";
import type { Ad } from "@/types";

interface SidebarArticle {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
  category: { name: string; color: string } | null;
}

export default function SidebarPublic({
  popular,
  sidebarAds = [],
}: {
  popular: SidebarArticle[];
  sidebarAds?: Ad[];
}) {
  return (
    <aside className="space-y-5 sm:space-y-6">
      {/* Search */}
      <div className="bg-surface-card rounded-2xl border border-surface-border p-5">
        <h3 className="font-display text-lg text-heading mb-3">Buscar</h3>
        <form action="/buscar" className="relative flex items-center">
          <input
            name="q"
            type="text"
            placeholder="Buscar noticias..."
            className="w-full px-4 py-2.5 pr-10 border border-surface-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
          <button
            type="submit"
            className="absolute right-2 p-1.5 text-muted hover:text-primary transition rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Sidebar ad — first */}
      {sidebarAds.length > 0 && <AdBanner ad={sidebarAds[0]} />}

      {/* Most read */}
      {popular.length > 0 && (
        <div className="bg-surface-card rounded-2xl border border-surface-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 className="font-display text-lg text-heading">Más leídas</h3>
          </div>
          <div className="space-y-4">
            {popular.map((article, i) => (
              <div key={article.slug} className="flex gap-3 items-start group">
                <span className="text-2xl font-extrabold leading-none flex-shrink-0 w-7 text-center text-surface-border group-hover:text-primary transition-colors">
                  {i + 1}
                </span>
                <div className="flex-1 border-b border-surface-border/50 pb-4 last:border-b-0 last:pb-0">
                  <ArticleCard {...article} size="small" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional sidebar ads */}
      {sidebarAds.slice(1).map((ad) => (
        <AdBanner key={ad.id} ad={ad} />
      ))}
    </aside>
  );
}
