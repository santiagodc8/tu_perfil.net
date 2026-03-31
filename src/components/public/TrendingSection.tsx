import Link from "next/link";
import Image from "next/image";
import { BLUR_DATA_URL } from "@/lib/utils";

interface TrendingArticle {
  title: string;
  slug: string;
  image_url: string | null;
  category: { name: string; color: string } | null;
}

interface TrendingSectionProps {
  articles: TrendingArticle[];
}

export default function TrendingSection({ articles }: TrendingSectionProps) {
  if (articles.length === 0) return null;

  return (
    <section className="animate-fade-in-up">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
          </span>
          <h2 className="font-display text-display-sm sm:text-display-md text-heading">
            Tendencias del día
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 xl:gap-5 stagger-children">
        {articles.map((article, i) => (
          <Link
            key={article.slug}
            href={`/noticia/${article.slug}`}
            className="group relative flex sm:flex-col items-start gap-3 sm:gap-0 bg-surface-card rounded-card border border-surface-border/50 overflow-hidden shadow-card card-hover cursor-pointer"
          >
            {/* Image */}
            <div className="relative w-20 h-20 sm:w-full sm:h-0 sm:pb-[60%] flex-shrink-0 overflow-hidden">
              {article.image_url ? (
                <Image
                  src={article.image_url}
                  alt={article.title}
                  fill
                  sizes="(max-width: 640px) 80px, (max-width: 1024px) 50vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200" />
              )}
              {/* Rank number */}
              <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-primary text-white font-extrabold text-sm sm:text-base rounded-lg shadow-lg">
                {i + 1}
              </span>
            </div>

            {/* Text */}
            <div className="flex-1 py-2 pr-3 sm:p-3 sm:pt-2.5">
              {article.category && (
                <span
                  className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: article.category.color }}
                >
                  {article.category.name}
                </span>
              )}
              <h3 className="text-sm font-bold text-heading leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200 mt-0.5">
                {article.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
