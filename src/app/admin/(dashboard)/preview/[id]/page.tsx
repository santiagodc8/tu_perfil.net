import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, BLUR_DATA_URL } from "@/lib/utils";

interface PreviewArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string | null;
  published: boolean;
  created_at: string;
  category: { name: string; color: string } | null;
}

export default async function PreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createAdminClient();

  const { data: article } = await supabase
    .from("articles")
    .select("id, title, slug, content, excerpt, image_url, published, created_at, category:categories(name, color)")
    .eq("id", params.id)
    .single()
    .returns<PreviewArticle>();

  if (!article) notFound();

  return (
    <div className="min-h-screen bg-surface-card">
      {/* Banner de preview */}
      <div className="sticky top-0 z-50 bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">VISTA PREVIA</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            article.published
              ? "bg-green-600 text-white"
              : "bg-surface-card/20 text-white"
          }`}>
            {article.published ? "Publicada" : "Borrador"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/noticias/${article.id}`}
            className="text-sm font-medium bg-surface-card/20 hover:bg-surface-card/30 px-4 py-1.5 rounded-lg transition"
          >
            Editar
          </Link>
          <Link
            href="/admin/noticias"
            className="text-sm font-medium bg-surface-card/20 hover:bg-surface-card/30 px-4 py-1.5 rounded-lg transition"
          >
            Cerrar
          </Link>
        </div>
      </div>

      {/* Contenido renderizado igual que el sitio publico */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <time className="text-sm text-muted">
            {formatDate(article.created_at)}
          </time>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-heading leading-tight mb-6">
          {article.title}
        </h1>

        {/* Image */}
        {article.image_url && (
          <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover"
              priority
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-heading prose-a:text-primary hover:prose-a:text-primary-dark"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </div>
  );
}
