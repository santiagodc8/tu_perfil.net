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
      {/* Sidebar ad — first */}
      {sidebarAds.length > 0 && <AdBanner ad={sidebarAds[0]} />}

      {/* Most read */}
      {popular.length > 0 && (
        <div className="bg-surface-card rounded-card border border-surface-border/50 shadow-card p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <h3 className="font-display text-display-sm text-heading">
              Más leídas
            </h3>
          </div>
          <div className="space-y-4">
            {popular.map((article, i) => (
              <div key={article.slug} className="flex gap-3 items-start group">
                <span className="text-2xl font-extrabold leading-none flex-shrink-0 w-7 text-center text-primary/20 group-hover:text-primary transition-colors duration-200">
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
