export const revalidate = 300; // Revalidar cada 5 minutos

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { smartDate, readingTime, BLUR_DATA_URL } from "@/lib/utils";
import ShareButtons from "@/components/public/ShareButtons";
import RelatedArticles from "@/components/public/RelatedArticles";
import ViewCounter from "@/components/public/ViewCounter";
import ImageGallery from "@/components/public/ImageGallery";

interface ArticleDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string | null;
  gallery: string[];
  category_id: string;
  author_name: string;
  views: number;
  created_at: string;
  category: { name: string; color: string; slug: string } | null;
}

interface RelatedArticle {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
  category: { name: string; color: string } | null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from("articles")
    .select("title, excerpt, image_url")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  if (!data) return { title: "Noticia no encontrada" };

  return {
    title: data.title,
    description: data.excerpt,
    openGraph: {
      title: data.title,
      description: data.excerpt,
      images: data.image_url ? [data.image_url] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.excerpt,
    },
  };
}

export default async function NoticiaPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("id, title, slug, content, excerpt, image_url, gallery, category_id, author_name, views, created_at, category:categories(name, color, slug)")
    .eq("slug", params.slug)
    .eq("published", true)
    .single()
    .returns<ArticleDetail>();

  if (!article) notFound();

  // Noticias relacionadas (misma categoria, excluyendo la actual)
  const { data: relatedData } = await supabase
    .from("articles")
    .select("title, slug, excerpt, image_url, created_at, category:categories(name, color)")
    .eq("published", true)
    .eq("category_id", article.category_id)
    .neq("id", article.id)
    .order("created_at", { ascending: false })
    .limit(3)
    .returns<RelatedArticle[]>();

  const articleUrl = `https://tuperfil.net/noticia/${article.slug}`;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: article.image_url ?? undefined,
    datePublished: article.created_at,
    author: {
      "@type": "Person",
      name: article.author_name,
    },
    publisher: {
      "@type": "Organization",
      name: "TuPerfil.net",
      url: "https://tuperfil.net",
    },
    mainEntityOfPage: articleUrl,
  };

  return (
    <>
      <ViewCounter articleId={article.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="container-custom py-4 sm:py-6">
        <div className="max-w-3xl mx-auto">
          {/* Category + meta */}
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
            {article.category && (
              <span
                className="text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: article.category.color }}
              >
                {article.category.name}
              </span>
            )}
            <span className="text-xs sm:text-sm text-muted">
              Por <span className="font-medium text-body">{article.author_name}</span>
            </span>
            <span className="text-xs sm:text-sm text-muted">·</span>
            <time className="text-xs sm:text-sm text-muted">
              {smartDate(article.created_at)}
            </time>
            <span className="text-xs sm:text-sm text-muted">·</span>
            <span className="text-xs sm:text-sm text-muted">
              {readingTime(article.content)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-heading leading-tight mb-4 sm:mb-6">
            {article.title}
          </h1>

          {/* Share */}
          <div className="mb-4 sm:mb-6">
            <ShareButtons title={article.title} url={articleUrl} />
          </div>

          {/* Image */}
          {article.image_url && (
            <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden mb-6 sm:mb-8 -mx-4 sm:mx-0">
              <Image
                src={article.image_url}
                alt={article.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
            </div>
          )}

          {/* Gallery */}
          {article.gallery && article.gallery.length > 0 && (
            <ImageGallery images={article.gallery} />
          )}

          {/* Content */}
          <div
            className="prose prose-sm sm:prose-lg max-w-none prose-headings:text-heading prose-a:text-primary hover:prose-a:text-primary-hover prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Share bottom */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-surface-border">
            <ShareButtons title={article.title} url={articleUrl} />
          </div>
        </div>

        {/* Related */}
        <div className="max-w-5xl mx-auto">
          <RelatedArticles articles={relatedData ?? []} />
        </div>
      </article>
    </>
  );
}
