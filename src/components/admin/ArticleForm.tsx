"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import RichTextEditor from "./RichTextEditor";
import ImageUpload from "./ImageUpload";
import { generateSlug } from "@/lib/utils";
import type { Article, Category } from "@/types";

interface ArticleFormProps {
  article?: Article;
}

export default function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!article;

  const [title, setTitle] = useState(article?.title ?? "");
  const [categoryId, setCategoryId] = useState(article?.category_id ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [imageUrl, setImageUrl] = useState(article?.image_url ?? null);
  const [published, setPublished] = useState(article?.published ?? false);
  const [categories, setCategories] = useState<Category[]>([]);
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

    if (isEditing) {
      const { error: dbError } = await supabase
        .from("articles")
        .update({
          title: title.trim(),
          slug,
          content,
          excerpt,
          image_url: imageUrl || null,
          category_id: categoryId,
          published,
        })
        .eq("id", article.id);

      if (dbError) {
        setError("Error al guardar: " + dbError.message);
        setSaving(false);
        return;
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Debes estar autenticado");
        setSaving(false);
        return;
      }

      const { error: dbError } = await supabase.from("articles").insert({
        title: title.trim(),
        slug,
        content,
        excerpt,
        image_url: imageUrl || null,
        category_id: categoryId,
        published,
        author_id: user.id,
      });

      if (dbError) {
        setError("Error al crear: " + dbError.message);
        setSaving(false);
        return;
      }
    }

    router.push("/admin/noticias");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-3xl space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Titulo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título de la noticia
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Escribe el título aquí..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-lg"
        />
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoría
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none bg-white"
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Imagen */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Imagen principal
        </label>
        <ImageUpload imageUrl={imageUrl} onUpload={setImageUrl} />
      </div>

      {/* Contenido */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contenido
        </label>
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      {/* Publicar toggle + boton */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-checked:bg-green-500 rounded-full transition" />
            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {published ? "Publicada" : "Borrador"}
          </span>
        </label>

        <button
          type="submit"
          disabled={saving}
          className="bg-accent hover:bg-accent-dark text-white font-bold text-lg px-8 py-3 rounded-xl transition disabled:opacity-50 shadow-lg shadow-accent/20"
        >
          {saving
            ? "Guardando..."
            : isEditing
            ? "Guardar cambios"
            : "Publicar noticia"}
        </button>
      </div>
    </form>
  );
}
