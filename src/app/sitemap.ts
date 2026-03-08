import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();
  const baseUrl = "https://tuperfil.net";

  // Paginas estaticas
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${baseUrl}/contacto`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/acerca-de`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/buscar`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
  ];

  // Categorias
  const { data: categories } = await supabase
    .from("categories")
    .select("slug");

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((cat) => ({
    url: `${baseUrl}/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Articulos publicados (excluyendo programados para el futuro)
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, updated_at")
    .eq("published", true)
    .or("published_at.is.null,published_at.lte." + new Date().toISOString())
    .order("created_at", { ascending: false });

  const articlePages: MetadataRoute.Sitemap = (articles ?? []).map((article) => ({
    url: `${baseUrl}/noticia/${article.slug}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...articlePages];
}
