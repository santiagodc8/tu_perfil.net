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
  size?: "default" | "small" | "featured";
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
      <Link href={`/noticia/${slug}`} className="group flex gap-3 cursor-pointer">
        <div className="relative w-24 h-20 sm:w-28 sm:h-[4.5rem] rounded-xl overflow-hidden flex-shrink-0 bg-surface">
          {image_url && (
            <Image
              src={image_url}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
              sizes="112px"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-heading group-hover:text-primary transition line-clamp-2 leading-snug">
            {title}
          </h4>
          <time className="text-xs text-muted mt-1.5 block">
            {smartDateShort(created_at)}
          </time>
        </div>
      </Link>
    );
  }

  if (size === "featured") {
    return (
      <Link href={`/noticia/${slug}`} className="group block cursor-pointer">
        <article className="bg-surface-card rounded-card overflow-hidden shadow-card card-hover h-full border border-surface-border/50">
          {/* Category color accent line */}
          {category && (
            <div
              className="h-[3px]"
              style={{ backgroundColor: category.color }}
            />
          )}
          <div className="relative aspect-[4/3] bg-surface overflow-hidden">
            {image_url ? (
              <Image
                src={image_url}
                alt={title}
                fill
                className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-surface-border to-surface" />
            )}
            {category && (
              <span
                className="absolute top-3 left-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-sm backdrop-blur-[2px]"
                style={{ backgroundColor: category.color }}
              >
                {category.name}
              </span>
            )}
          </div>
          <div className="p-5 sm:p-6">
            <h3 className="font-display text-lg sm:text-xl text-heading group-hover:text-primary transition-colors duration-200 line-clamp-3 leading-snug group-hover:underline decoration-primary/30 decoration-2 underline-offset-4">
              {title}
            </h3>
            <p className="text-sm text-muted mt-2 line-clamp-3 leading-relaxed">
              {excerpt}
            </p>
            <time className="text-xs text-muted mt-3 block">
              {smartDateShort(created_at)}
            </time>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/noticia/${slug}`} className="group block cursor-pointer">
      <article className="bg-surface-card rounded-card overflow-hidden shadow-card card-hover h-full border border-surface-border/50">
        {/* Category color accent line */}
        {category && (
          <div
            className="h-[3px]"
            style={{ backgroundColor: category.color }}
          />
        )}
        <div className="relative aspect-video bg-surface overflow-hidden">
          {image_url ? (
            <Image
              src={image_url}
              alt={title}
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-surface-border to-surface" />
          )}
          {category && (
            <span
              className="absolute top-3 left-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-sm backdrop-blur-[2px]"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </span>
          )}
        </div>
        <div className="p-4 sm:p-5">
          <h3 className="font-display text-base sm:text-lg text-heading group-hover:text-primary transition-colors duration-200 line-clamp-2 leading-snug group-hover:underline decoration-primary/30 decoration-2 underline-offset-4">
            {title}
          </h3>
          <p className="text-sm text-muted mt-2 line-clamp-2 hidden sm:block leading-relaxed">
            {excerpt}
          </p>
          <time className="text-xs text-muted mt-3 block">
            {smartDateShort(created_at)}
          </time>
        </div>
      </article>
    </Link>
  );
}
