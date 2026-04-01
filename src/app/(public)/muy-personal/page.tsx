export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { smartDateShort, BLUR_DATA_URL } from "@/lib/utils";
import Breadcrumbs from "@/components/public/Breadcrumbs";

export const metadata: Metadata = {
  title: "Muy Personal — Opiniones y Videos",
  description:
    "Opiniones personales y videos de la redacción de TuPerfil.net.",
  openGraph: {
    title: "Muy Personal — Opiniones y Videos",
    description: "Opiniones personales y videos de la redacción de TuPerfil.net.",
  },
};

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

export default async function MuyPersonalPage() {
  const supabase = createClient();

  // Obtener la categoría "Muy Personal"
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug, color")
    .eq("slug", "muy-personal")
    .single();

  if (!category) {
    return (
      <div className="container-custom py-16 text-center text-muted">
        La sección Muy Personal estará disponible pronto.
      </div>
    );
  }

  const { data: articles, count } = await supabase
    .from("articles")
    .select("title, slug, excerpt, image_url, video_url, author_name, created_at", {
      count: "exact",
    })
    .eq("published", true)
    .eq("category_id", category.id)
    .order("created_at", { ascending: false })
    .limit(30)
    .returns<PersonalArticle[]>();

  const total = count ?? 0;
  const list = articles ?? [];

  return (
    <div className="container-custom py-5 sm:py-8">
      {/* Decorative gradient */}
      <div
        className="h-1 rounded-full mb-6 sm:mb-8 opacity-20"
        style={{
          background: `linear-gradient(to right, #F97316, transparent)`,
        }}
      />

      <div className="mb-4 sm:mb-5">
        <Breadcrumbs items={[{ label: "Muy Personal" }]} />
      </div>

      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
          <span className="w-1.5 h-8 sm:h-10 rounded-full bg-[#F97316]" />
          <h1 className="font-display text-display-sm sm:text-display-md md:text-display-lg lg:text-display-xl text-heading tracking-tight">
            Muy Personal
          </h1>
        </div>
        <p className="text-muted text-sm sm:text-base mb-3">
          Opiniones personales y videos de nuestra redacción.
        </p>
        <span className="inline-block bg-surface-card border border-surface-border rounded-full px-3.5 py-1 text-xs font-medium text-muted">
          {total} {total === 1 ? "publicación" : "publicaciones"}
        </span>
      </div>

      {/* Grid */}
      {list.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {list.map((article) => {
            const thumb = getThumbnail(article);
            const isVideo = !!article.video_url;

            return (
              <Link
                key={article.slug}
                href={`/noticia/${article.slug}`}
                className="group bg-surface-card rounded-card border border-surface-border/50 overflow-hidden shadow-card card-hover pressable cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={article.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                        <svg
                          className="w-5 h-5 text-white ml-0.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white bg-[#F97316] shadow-sm">
                    {isVideo ? "Video" : "Opinión"}
                  </span>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-[11px] text-muted mb-1.5">
                    <span>por {article.author_name}</span>
                    <span className="bg-muted size-1 rounded-full" />
                    <span>{smartDateShort(article.created_at)}</span>
                  </div>
                  <h3 className="text-base font-bold text-heading leading-snug line-clamp-2 group-hover:text-[#F97316] transition-colors duration-200">
                    {article.title}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-muted">
          No hay publicaciones en esta sección todavía.
        </div>
      )}
    </div>
  );
}
