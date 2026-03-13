"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import RichTextEditor from "./RichTextEditor";
import ImageUpload from "./ImageUpload";
import GalleryUpload from "./GalleryUpload";
import { generateSlug } from "@/lib/utils";
import type { Article, Category, Tag } from "@/types";

interface ArticleFormProps {
  article?: Article;
  allTags?: Tag[];
  selectedTagIds?: string[];
}

export default function ArticleForm({
  article,
  allTags = [],
  selectedTagIds = [],
}: ArticleFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!article;

  const [title, setTitle] = useState(article?.title ?? "");
  const [authorName, setAuthorName] = useState(article?.author_name ?? "Redacción TuPerfil.net");
  const [categoryId, setCategoryId] = useState(article?.category_id ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [imageUrl, setImageUrl] = useState(article?.image_url ?? null);
  const [gallery, setGallery] = useState<string[]>(article?.gallery ?? []);
  const [published, setPublished] = useState(article?.published ?? false);
  const [featured, setFeatured] = useState(article?.featured ?? false);
  const [scheduled, setScheduled] = useState(!!article?.published_at);
  const [publishedAt, setPublishedAt] = useState(
    article?.published_at
      ? new Date(article.published_at).toISOString().slice(0, 16)
      : ""
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [pickedTagIds, setPickedTagIds] = useState<string[]>(selectedTagIds);
  const [notifySubscribers, setNotifySubscribers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCategories(data ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function extractExcerpt(html: string): string {
    const text = html.replace(/<[^>]+>/g, "").trim();
    return text.length > 200 ? text.slice(0, 200).trimEnd() + "..." : text;
  }

  function toggleTag(tagId: string) {
    setPickedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function syncTags(articleId: string) {
    // Delete all existing tags for this article, then insert selected ones
    await supabase.from("article_tags").delete().eq("article_id", articleId);
    if (pickedTagIds.length > 0) {
      await supabase.from("article_tags").insert(
        pickedTagIds.map((tagId) => ({ article_id: articleId, tag_id: tagId }))
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("El título es obligatorio");
      return;
    }
    if (!categoryId) {
      setError("Selecciona una categoría");
      return;
    }

    setSaving(true);
    setError("");

    const slug = generateSlug(title);
    const excerpt = extractExcerpt(content);
    const publishDate =
      published && scheduled && publishedAt
        ? new Date(publishedAt).toISOString()
        : null;

    const articleData = {
      title: title.trim(),
      slug,
      content,
      excerpt,
      image_url: imageUrl || null,
      gallery,
      category_id: categoryId,
      author_name: authorName.trim() || "Redacción TuPerfil.net",
      published,
      published_at: publishDate,
      featured,
    };

    if (isEditing) {
      const { error: dbError } = await supabase
        .from("articles")
        .update(articleData)
        .eq("id", article.id);

      if (dbError) {
        setError("Error al guardar: " + dbError.message);
        setSaving(false);
        return;
      }

      await syncTags(article.id);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Debes estar autenticado");
        setSaving(false);
        return;
      }

      const { data: newArticle, error: dbError } = await supabase
        .from("articles")
        .insert({ ...articleData, author_id: user.id })
        .select("id")
        .single();

      if (dbError || !newArticle) {
        setError("Error al crear: " + (dbError?.message ?? "Error desconocido"));
        setSaving(false);
        return;
      }

      await syncTags(newArticle.id);
    }

    // Notificar suscriptores si está marcado y el artículo se publica
    if (notifySubscribers && published && !scheduled) {
      const slug = generateSlug(title);
      try {
        await fetch("/api/newsletter/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            slug,
            excerpt: extractExcerpt(content),
            imageUrl: imageUrl || null,
            categoryName:
              categories.find((c) => c.id === categoryId)?.name ?? "",
          }),
        });
      } catch {
        // Non-blocking: article is already saved
      }
    }

    router.push("/admin/noticias");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 md:p-6 max-w-3xl space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Titulo */}
      <div>
        <label className="block text-sm font-medium text-body mb-1">
          Título de la noticia
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Escribe el título aquí..."
          className="w-full px-4 py-3 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg"
        />
      </div>

      {/* Autor */}
      <div>
        <label className="block text-sm font-medium text-body mb-1">
          Autor
        </label>
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Nombre del autor"
          className="w-full px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        />
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-body mb-1">
          Categoría
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-surface-card"
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Etiquetas */}
      {allTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Etiquetas{" "}
            <span className="text-muted font-normal">(opcional — tocá para seleccionar)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const selected = pickedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
                    selected
                      ? "bg-primary text-white border-primary"
                      : "bg-surface-card text-body border-surface-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {selected && <span className="mr-1">✓</span>}
                  {tag.name}
                </button>
              );
            })}
          </div>
          {pickedTagIds.length > 0 && (
            <p className="text-xs text-muted mt-1.5">
              {pickedTagIds.length} etiqueta{pickedTagIds.length !== 1 ? "s" : ""} seleccionada{pickedTagIds.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {/* Imagen */}
      <div>
        <label className="block text-sm font-medium text-body mb-1">
          Imagen principal
        </label>
        <ImageUpload imageUrl={imageUrl} onUpload={setImageUrl} />
      </div>

      {/* Galería */}
      <div>
        <label className="block text-sm font-medium text-body mb-1">
          Galería de imágenes <span className="text-muted font-normal">(opcional)</span>
        </label>
        <GalleryUpload images={gallery} onChange={setGallery} />
      </div>

      {/* Contenido */}
      <div>
        <label className="block text-sm font-medium text-body mb-1">
          Contenido
        </label>
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      {/* Toggles + programación + botón */}
      <div className="space-y-4 pt-4 border-t border-surface-border">
        <div className="flex items-center gap-6 flex-wrap">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => {
                  setPublished(e.target.checked);
                  if (!e.target.checked) setScheduled(false);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-checked:bg-green-500 rounded-full transition" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-surface-card rounded-full shadow peer-checked:translate-x-5 transition" />
            </div>
            <span className="text-sm font-medium text-body">
              {published
                ? scheduled && publishedAt
                  ? "Programada"
                  : "Publicada"
                : "Borrador"}
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-checked:bg-amber-500 rounded-full transition" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-surface-card rounded-full shadow peer-checked:translate-x-5 transition" />
            </div>
            <span className="text-sm font-medium text-body">
              {featured ? "Destacada" : "Normal"}
            </span>
          </label>

          {published && !scheduled && (
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={notifySubscribers}
                  onChange={(e) => setNotifySubscribers(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-checked:bg-blue-500 rounded-full transition" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-surface-card rounded-full shadow peer-checked:translate-x-5 transition" />
              </div>
              <span className="text-sm font-medium text-body">
                Notificar suscriptores
              </span>
            </label>
          )}
        </div>

        {/* Programar publicación */}
        {published && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={scheduled}
                  onChange={(e) => {
                    setScheduled(e.target.checked);
                    if (!e.target.checked) setPublishedAt("");
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-checked:bg-blue-500 rounded-full transition" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-surface-card rounded-full shadow peer-checked:translate-x-5 transition" />
              </div>
              <span className="text-sm font-medium text-body">
                Programar para después
              </span>
            </label>

            {scheduled && (
              <div>
                <label className="block text-sm text-body mb-1">
                  Fecha y hora de publicación
                </label>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                />
                {publishedAt && new Date(publishedAt) > new Date() && (
                  <p className="text-xs text-blue-600 mt-1.5 font-medium">
                    Se publicará automáticamente el{" "}
                    {new Date(publishedAt).toLocaleString("es-ES", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          {isEditing && (
            <a
              href={`/admin/preview/${article.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl border-2 border-surface-border text-body font-semibold hover:border-primary hover:text-primary transition text-lg"
            >
              Vista previa
            </a>
          )}
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary-dark text-white font-bold text-lg px-8 py-3 rounded-xl transition disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {saving
              ? "Guardando..."
              : isEditing
              ? "Guardar cambios"
              : "Publicar noticia"}
          </button>
        </div>
      </div>
    </form>
  );
}
