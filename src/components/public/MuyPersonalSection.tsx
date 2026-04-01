import Link from "next/link";
import Image from "next/image";
import { BLUR_DATA_URL, smartDateShort } from "@/lib/utils";

interface PersonalArticle {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  video_url: string | null;
  author_name: string;
  created_at: string;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

function getThumbnail(article: PersonalArticle): string | null {
  if (article.video_url) {
    const ytId = getYouTubeId(article.video_url);
    if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  return article.image_url;
}

export default function MuyPersonalSection({
  articles,
}: {
  articles: PersonalArticle[];
}) {
  if (articles.length === 0) return null;

  const [featured, ...rest] = articles;
  const featuredThumb = getThumbnail(featured);
  const hasVideo = !!featured.video_url;

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-8 sm:h-10 rounded-full bg-[#F97316]" />
          <div>
            <h2 className="font-display text-display-sm sm:text-display-md text-heading tracking-tight">
              Muy Personal
            </h2>
            <p className="text-xs sm:text-sm text-muted">Opiniones y videos</p>
          </div>
        </div>
        <Link
          href="/muy-personal"
          className="text-sm font-semibold text-[#F97316] hover:text-[#EA580C] transition"
        >
          Ver todo
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
        {/* Featured / large card */}
        <Link
          href={`/noticia/${featured.slug}`}
          className="lg:col-span-3 group relative bg-surface-card rounded-card border border-surface-border/50 overflow-hidden shadow-card card-hover pressable cursor-pointer"
        >
          <div className="relative aspect-video overflow-hidden">
            {featuredThumb ? (
              <Image
                src={featuredThumb}
                alt={featured.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-transform duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#F97316]/20 to-[#F97316]/5" />
            )}
            {/* Play icon overlay for video */}
            {hasVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#F97316] transition-colors duration-300">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
            {/* Badge */}
            <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white bg-[#F97316] shadow-sm">
              {hasVideo ? "Video" : "Opinión"}
            </span>
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-muted mb-2">
              <span>por {featured.author_name}</span>
              <span className="bg-muted size-1 rounded-full" />
              <span>{smartDateShort(featured.created_at)}</span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-heading leading-snug line-clamp-2 group-hover:text-[#F97316] transition-colors duration-200">
              {featured.title}
            </h3>
            {featured.excerpt && (
              <p className="text-sm text-muted mt-2 line-clamp-2 hidden sm:block">
                {featured.excerpt}
              </p>
            )}
          </div>
        </Link>

        {/* Secondary cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
          {rest.slice(0, 3).map((article) => {
            const thumb = getThumbnail(article);
            const isVideo = !!article.video_url;

            return (
              <Link
                key={article.slug}
                href={`/noticia/${article.slug}`}
                className="group flex gap-3 bg-surface-card rounded-card border border-surface-border/50 overflow-hidden shadow-card card-hover pressable cursor-pointer p-3"
              >
                {/* Thumbnail */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-24 lg:h-24 rounded-lg overflow-hidden flex-shrink-0">
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={article.title}
                      fill
                      sizes="120px"
                      className="object-cover transition-transform duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F97316]/20 to-[#F97316]/5" />
                  )}
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] mb-1">
                    {isVideo ? "Video" : "Opinión"}
                  </span>
                  <h3 className="text-sm font-bold text-heading leading-snug line-clamp-2 group-hover:text-[#F97316] transition-colors duration-200">
                    {article.title}
                  </h3>
                  <span className="text-[11px] text-muted mt-1.5">
                    {smartDateShort(article.created_at)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
