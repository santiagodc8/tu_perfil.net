export const revalidate = 300; // Revalidar cada 5 minutos

import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://tuperfil.net";
const FEED_TITLE = "TuPerfil.net — Portal de Noticias";
const FEED_DESCRIPTION =
  "Portal de noticias regional. Política, judicial, salud, deportes, regional e internacional.";
const FEED_LANGUAGE = "es-AR";

interface FeedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author_name: string;
  published_at: string | null;
  created_at: string;
  category: { name: string; slug: string } | null;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(dateStr: string): string {
  return new Date(dateStr).toUTCString();
}

export async function GET(): Promise<Response> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, title, slug, excerpt, author_name, published_at, created_at, category:categories(name, slug)"
    )
    .eq("published", true)
    .lte("published_at", now)
    .order("published_at", { ascending: false })
    .limit(20)
    .returns<FeedArticle[]>();

  if (error) {
    return new Response("Error al generar el feed RSS", { status: 500 });
  }

  const articles = data ?? [];

  const lastBuildDate =
    articles.length > 0
      ? toRfc822(articles[0].published_at ?? articles[0].created_at)
      : toRfc822(now);

  const items = articles
    .map((article) => {
      const pubDate = toRfc822(
        article.published_at ?? article.created_at
      );
      const articleUrl = `${SITE_URL}/noticia/${article.slug}`;
      const categoryName = article.category?.name ?? "Sin categoría";
      const author = escapeXml(article.author_name ?? "Redacción TuPerfil.net");
      const title = escapeXml(article.title);
      const excerpt = escapeXml(article.excerpt ?? "");

      return `
    <item>
      <title>${title}</title>
      <link>${articleUrl}</link>
      <description>${excerpt}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(categoryName)}</category>
      <author>${author}</author>
      <guid isPermaLink="true">${articleUrl}</guid>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>${FEED_LANGUAGE}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
