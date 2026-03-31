import Link from "next/link";
import ArticleCard from "./ArticleCard";

interface ArticleData {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
}

interface CategorySectionProps {
  name: string;
  slug: string;
  color: string;
  articles: ArticleData[];
}

export default function CategorySection({
  name,
  slug,
  color,
  articles,
}: CategorySectionProps) {
  if (articles.length === 0) return null;

  return (
    <section className="pb-8 sm:pb-10">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div className="flex items-center gap-3">
          <span
            className="w-1 h-7 sm:h-8 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h2 className="font-display text-display-sm sm:text-display-md text-heading">
            {name}
          </h2>
        </div>
        <Link
          href={`/${slug}`}
          className="text-sm font-semibold text-primary hover:text-primary-dark transition inline-flex items-center gap-1 group cursor-pointer"
        >
          Ver más
          <svg
            className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {/* Featured first + regular grid */}
      {articles.length >= 3 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 stagger-children">
          <div className="sm:col-span-1 sm:row-span-2">
            <ArticleCard
              {...articles[0]}
              category={{ name, color }}
              size="featured"
            />
          </div>
          {articles.slice(1).map((article) => (
            <ArticleCard
              key={article.slug}
              {...article}
              category={{ name, color }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 stagger-children">
          {articles.map((article) => (
            <ArticleCard
              key={article.slug}
              {...article}
              category={{ name, color }}
            />
          ))}
        </div>
      )}

      {/* Section divider */}
      <div className="mt-8 sm:mt-10 h-px bg-gradient-to-r from-transparent via-surface-border to-transparent" />
    </section>
  );
}
