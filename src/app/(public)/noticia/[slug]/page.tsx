export const revalidate = 300; // Revalidar cada 5 minutos

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { smartDate, readingTime, generateSlug, BLUR_DATA_URL } from "@/lib/utils";
import ShareButtons from "@/components/public/ShareButtons";
import RelatedArticles from "@/components/public/RelatedArticles";
import ViewCounter from "@/components/public/ViewCounter";
import ImageGallery from "@/components/public/ImageGallery";
import Breadcrumbs from "@/components/public/Breadcrumbs";
import CommentList from "@/components/public/CommentList";
import CommentForm from "@/components/public/CommentForm";
import ArticleBody from "@/components/public/ArticleBody";
import FloatingWhatsApp from "@/components/public/FloatingWhatsApp";
import AdBanner from "@/components/public/AdBanner";
import type { Ad } from "@/types";
import { Suspense } from "react";

interface ArticleTag {
  tag: { id: string; name: string; slug: string };
}

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
  article_tags: ArticleTag[];
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
    .select("title, excerpt")
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
      type: "article",
      // og:image es generada automáticamente por opengraph-image.tsx
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.excerpt,
      // twitter:image es generada automáticamente por opengraph-image.tsx
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
    .select("id, title, slug, content, excerpt, image_url, gallery, category_id, author_name, views, created_at, category:categories(name, color, slug), article_tags(tag:tags(id, name, slug))")
    .eq("slug", params.slug)
    .eq("published", true)
    .single()
    .returns<ArticleDetail>();

  if (!article) notFound();

  // Noticias relacionadas: primero por tags en común, luego fallback a categoría
  const { data: tagRelated } = await supabase.rpc("related_articles_by_tags", {
    p_article_id: article.id,
    p_category_id: article.category_id,
    lim: 4,
  });

  let relatedData: RelatedArticle[] = (tagRelated ?? []).map(
    (r: { title: string; slug: string; excerpt: string; image_url: string | null; created_at: string; category_name: string | null; category_color: string | null }) => ({
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      image_url: r.image_url,
      created_at: r.created_at,
      category: r.category_name ? { name: r.category_name, color: r.category_color! } : null,
    })
  );

  // Fallback: si no hay suficientes por tags, completar con misma categoría
  if (relatedData.length < 4) {
    const existingSlugs = new Set(relatedData.map((a) => a.slug));
    const { data: catRelated } = await supabase
      .from("articles")
      .select("title, slug, excerpt, image_url, created_at, category:categories(name, color)")
      .eq("published", true)
      .eq("category_id", article.category_id)
      .neq("id", article.id)
      .order("created_at", { ascending: false })
      .limit(4)
      .returns<RelatedArticle[]>();

    for (const a of catRelated ?? []) {
      if (relatedData.length >= 4) break;
      if (!existingSlugs.has(a.slug)) {
        relatedData.push(a);
      }
    }
  }

  // Publicidad en artículos (between_articles se reutiliza aquí)
  const { data: articleAdsData } = await supabase
    .from("ads")
    .select("*")
    .eq("active", true)
    .in("position", ["between_articles", "header"])
    .order("sort_order", { ascending: true })
    .limit(1)
    .returns<Ad[]>();

  const articleAd = articleAdsData?.[0] ?? null;

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
      url: `https://tuperfil.net/autor/${generateSlug(article.author_name)}`,
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

      <article className="container-custom py-5 sm:py-8">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumbs */}
          <div className="mb-5">
            <Breadcrumbs
              items={[
                ...(article.category
                  ? [{ label: article.category.name, href: `/${article.category.slug}` }]
                  : []),
                { label: article.title },
              ]}
            />
          </div>

          {/* Category badge */}
          {article.category && (
            <span
              className="inline-block text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white mb-4"
              style={{ backgroundColor: article.category.color }}
            >
              {article.category.name}
            </span>
          )}

          {/* Title */}
          <h1 className="font-display text-display-md sm:text-display-lg md:text-display-xl text-heading leading-[1.1] tracking-tight mb-4 sm:mb-5">
            {article.title}
          </h1>

          {/* Meta line */}
          <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6 flex-wrap text-sm text-muted">
            <span>
              Por{" "}
              <Link
                href={`/autor/${generateSlug(article.author_name)}`}
                className="font-medium text-body hover:text-primary transition"
              >
                {article.author_name}
              </Link>
            </span>
            <span className="text-surface-border">|</span>
            <time>{smartDate(article.created_at)}</time>
            <span className="text-surface-border">|</span>
            <span>{readingTime(article.content)}</span>
          </div>

          {/* Share */}
          <div className="mb-5 sm:mb-6">
            <ShareButtons title={article.title} url={articleUrl} />
          </div>

          {/* Image */}
          {article.image_url && (
            <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 -mx-4 sm:mx-0 shadow-card">
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
          <ArticleBody
            content={article.content}
            initialProseClass="prose prose-sm sm:prose-lg prose-headings:font-display prose-p:leading-[1.8]"
          />

          {/* Share bottom */}
          <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-surface-border">
            <ShareButtons title={article.title} url={articleUrl} />
          </div>

          {/* Etiquetas */}
          {article.article_tags && article.article_tags.length > 0 && (
            <div className="mt-5 sm:mt-6 flex flex-wrap gap-2">
              {article.article_tags.map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/etiqueta/${tag.slug}`}
                  className="inline-block px-3.5 py-1.5 rounded-full text-xs font-medium bg-surface border border-surface-border text-body hover:bg-primary hover:text-white hover:border-primary transition-colors cursor-pointer"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Publicidad en artículo */}
          {articleAd && (
            <div className="mt-8 sm:mt-10">
              <AdBanner ad={articleAd} />
            </div>
          )}

          {/* Comentarios */}
          <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-surface-border">
            <h2 className="font-display text-display-sm text-heading mb-6">Comentarios</h2>
            <Suspense fallback={<div className="text-sm text-muted animate-pulse">Cargando comentarios...</div>}>
              <CommentList articleId={article.id} />
            </Suspense>
            <div className="mt-8">
              <h3 className="font-display text-lg text-heading mb-4">Dejá tu comentario</h3>
              <CommentForm articleId={article.id} />
            </div>
          </div>
        </div>

        {/* Related */}
        <div className="max-w-5xl mx-auto">
          <RelatedArticles articles={relatedData ?? []} />
        </div>
      </article>

      {/* Floating WhatsApp share button — mobile only */}
      <FloatingWhatsApp title={article.title} slug={article.slug} />
    </>
  );
}
