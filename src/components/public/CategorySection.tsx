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
    <section>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-heading flex items-center gap-2">
          <span className="w-1 h-5 sm:h-6 rounded-full" style={{ backgroundColor: color }} />
          {name}
        </h2>
        <Link
          href={`/${slug}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Ver más
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
