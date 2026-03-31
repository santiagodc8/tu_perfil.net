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
    <section className="section-divider pb-8 sm:pb-10">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <span
            className="w-1 h-7 sm:h-8 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h2 className="font-display text-xl sm:text-2xl text-heading">
            {name}
          </h2>
        </div>
        <Link
          href={`/${slug}`}
          className="text-sm font-semibold text-primary hover:text-primary-dark transition inline-flex items-center gap-1 group"
        >
          Ver más
          <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 stagger-children">
        {articles.map((article) => (
          <ArticleCard
            key={article.slug}
            {...article}
            category={{ name, color }}
          />
        ))}
      </div>
    </section>
  );
}
