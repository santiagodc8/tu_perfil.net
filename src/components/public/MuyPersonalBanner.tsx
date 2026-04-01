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

export default function MuyPersonalBanner({
  article,
}: {
  article: PersonalArticle;
}) {
  const thumb = getThumbnail(article);
  const isVideo = !!article.video_url;

  return (
    <Link
      href={`/noticia/${article.slug}`}
      className="group flex flex-col sm:flex-row items-stretch bg-surface-card rounded-card border border-[#F97316]/20 overflow-hidden shadow-card card-hover pressable cursor-pointer"
    >
      {/* Imagen */}
      <div className="relative w-full sm:w-48 md:w-64 h-44 sm:h-auto flex-shrink-0 overflow-hidden">
        {thumb ? (
          <Image
            src={thumb}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, 256px"
            className="object-cover transition-transform duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#F97316]/20 to-[#F97316]/5" />
        )}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#F97316] transition-colors duration-300">
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
        <span className="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white bg-[#F97316] shadow-sm">
          {isVideo ? "Video" : "Opinión"}
        </span>
      </div>

      {/* Contenido */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center border-l-0 sm:border-l-[3px] border-t-[3px] sm:border-t-0 border-[#F97316]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#F97316]">
            Muy Personal
          </span>
          <span className="bg-muted size-1 rounded-full" />
          <span className="text-[10px] sm:text-[11px] text-muted">
            {smartDateShort(article.created_at)}
          </span>
        </div>
        <h3 className="font-display text-lg sm:text-xl font-bold text-heading leading-snug line-clamp-2 group-hover:text-[#F97316] transition-colors duration-200">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-muted mt-1.5 line-clamp-2 hidden sm:block">
            {article.excerpt}
          </p>
        )}
        <span className="text-xs text-muted mt-2">
          por {article.author_name}
        </span>
      </div>
    </Link>
  );
}
