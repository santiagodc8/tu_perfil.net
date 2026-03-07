import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import ShareButtons from "@/components/public/ShareButtons";
import RelatedArticles from "@/components/public/RelatedArticles";

interface ArticleDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string | null;
  category_id: string;
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
    .select("id, title, slug, content, excerpt, image_url, category_id, views, created_at, category:categories(name, color, slug)")
    .eq("slug", params.slug)
    .eq("published", true)
    .single()
    .returns<ArticleDetail>();

  if (!article) notFound();

  // Incrementar vistas con admin client (bypasses RLS)
  const adminClient = createAdminClient();
  await adminClient
    .from("articles")
    .update({ views: article.views + 1 })
    .eq("id", article.id);

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
    publisher: {
      "@type": "Organization",
      name: "TuPerfil.net",
      url: "https://tuperfil.net",
    },
    mainEntityOfPage: articleUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="container-custom py-6">
        <div className="max-w-3xl mx-auto">
          {/* Category + date */}
          <div className="flex items-center gap-3 mb-4">
            {article.category && (
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: article.category.color }}
              >
                {article.category.name}
              </span>
            )}
            <time className="text-sm text-gray-400">
              {formatDate(article.created_at)}
            </time>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
            {article.title}
          </h1>

          {/* Share */}
          <div className="mb-6">
            <ShareButtons title={article.title} url={articleUrl} />
          </div>

          {/* Image */}
          {article.image_url && (
            <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
              <Image
                src={article.image_url}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-accent hover:prose-a:text-accent-dark"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Share bottom */}
          <div className="mt-8 pt-6 border-t border-gray-200">
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
