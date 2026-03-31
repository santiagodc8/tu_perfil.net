import Link from "next/link";
import Image from "next/image";
import { smartDateShort, BLUR_DATA_URL } from "@/lib/utils";

interface ArticleCardProps {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
  category: { name: string; color: string } | null;
  size?: "default" | "small";
}

export default function ArticleCard({
  title,
  slug,
  excerpt,
  image_url,
  created_at,
  category,
  size = "default",
}: ArticleCardProps) {
  if (size === "small") {
    return (
      <Link href={`/noticia/${slug}`} className="group flex gap-3">
        <div className="relative w-20 h-16 sm:w-24 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          {image_url && (
            <Image
              src={image_url}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
              sizes="96px"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-heading group-hover:text-primary transition line-clamp-2 leading-snug">
            {title}
          </h4>
          <time className="text-xs text-muted mt-1 block">
            {smartDateShort(created_at)}
          </time>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/noticia/${slug}`} className="group block">
      <article className="bg-surface-card rounded-2xl overflow-hidden border border-surface-border card-hover h-full">
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          {image_url ? (
            <Image
              src={image_url}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100" />
          )}
          {/* Category badge overlaid on image */}
          {category && (
            <span
              className="absolute top-3 left-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded text-white shadow-sm"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </span>
          )}
        </div>
        <div className="p-4 sm:p-5">
          <h3 className="font-display text-base sm:text-lg text-heading group-hover:text-primary transition-colors duration-200 line-clamp-2 leading-snug">
            {title}
          </h3>
          <p className="text-sm text-muted mt-2 line-clamp-2 hidden sm:block leading-relaxed">{excerpt}</p>
          <div className="flex items-center justify-between mt-3">
            <time className="text-xs text-muted">
              {smartDateShort(created_at)}
            </time>
            <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 inline-flex items-center gap-0.5">
              Leer
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
