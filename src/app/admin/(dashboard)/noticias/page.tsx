"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AdminHeader from "@/components/admin/AdminHeader";
import { formatDateShort, generateSlug } from "@/lib/utils";
import type { Category } from "@/types";

interface ArticleRow {
  id: string;
  title: string;
  published: boolean;
  published_at: string | null;
  featured: boolean;
  views: number;
  created_at: string;
  deleted_at: string | null;
  category: { name: string; color: string } | null;
}

type StatusFilter = "all" | "published" | "draft" | "scheduled" | "trash";

function getStatus(article: ArticleRow): "published" | "draft" | "scheduled" {
  if (
    article.published &&
    article.published_at &&
    new Date(article.published_at) > new Date()
  )
    return "scheduled";
  if (article.published) return "published";
  return "draft";
}

export default function NoticiasPage() {
  const supabase = createClient();
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("");

  async function fetchData() {
    const [{ data: articlesData }, { data: categoriesData }] = await Promise.all([
      supabase
        .from("articles")
        .select(
          "id, title, published, published_at, featured, views, created_at, deleted_at, category:categories(name, color)"
        )
        .order("created_at", { ascending: false })
        .returns<ArticleRow[]>(),
      supabase.from("categories").select("*").order("name"),
    ]);
    setArticles(articlesData ?? []);
    setCategories(categoriesData ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Enviar esta noticia a la papelera?")) return;
    await supabase
      .from("articles")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    fetchData();
  }

  async function handleRestore(id: string) {
    await supabase
      .from("articles")
      .update({ deleted_at: null })
      .eq("id", id);
    fetchData();
  }

  async function handlePermanentDelete(id: string) {
    if (
      !confirm(
        "¿Eliminar DEFINITIVAMENTE esta noticia? Esta acción no se puede deshacer."
      )
    )
      return;
    await supabase.from("articles").delete().eq("id", id);
    fetchData();
  }

  async function handleDuplicate(id: string) {
    const [{ data: original }, { data: tagRows }] = await Promise.all([
      supabase.from("articles").select("*").eq("id", id).single(),
      supabase.from("article_tags").select("tag_id").eq("article_id", id),
    ]);
    if (!original) return;

    const newTitle = `Copia de ${original.title}`;
    const { data: inserted, error } = await supabase
      .from("articles")
      .insert({
        title: newTitle,
        slug: generateSlug(newTitle),
        content: original.content,
        excerpt: original.excerpt,
        category_id: original.category_id,
        author_name: original.author_name,
        author_id: original.author_id,
        published: false,
        featured: false,
        views: 0,
        image_url: null,
        gallery: [],
      })
      .select("id")
      .single();

    if (error || !inserted) return;

    if (tagRows && tagRows.length > 0) {
      await supabase.from("article_tags").insert(
        tagRows.map((row: { tag_id: string }) => ({
          article_id: inserted.id,
          tag_id: row.tag_id,
        }))
      );
    }

    router.push(`/admin/noticias/${inserted.id}`);
  }

  const activeArticles = articles.filter((a) => !a.deleted_at);
  const trashedArticles = articles.filter((a) => !!a.deleted_at);

  const filtered =
    statusFilter === "trash"
      ? trashedArticles
      : activeArticles.filter((a) => {
          if (statusFilter !== "all" && getStatus(a) !== statusFilter) return false;
          if (categoryFilter && a.category?.name !== categoryFilter) return false;
          return true;
        });

  const counts = {
    all: activeArticles.length,
    published: activeArticles.filter((a) => getStatus(a) === "published").length,
    draft: activeArticles.filter((a) => getStatus(a) === "draft").length,
    scheduled: activeArticles.filter((a) => getStatus(a) === "scheduled").length,
    trash: trashedArticles.length,
  };

  const isTrash = statusFilter === "trash";

  return (
    <div>
      <AdminHeader title="Noticias" />
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/noticias/nueva"
            className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg transition"
          >
            + Nueva noticia
          </Link>

          {/* Filtro por categoría */}
          {!isTrash && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-surface-border rounded-lg text-sm bg-surface-card focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Tabs de estado */}
        <div className="flex gap-1 bg-surface p-1 rounded-lg w-fit overflow-x-auto">
          {([
            { key: "all", label: "Todas" },
            { key: "published", label: "Publicadas" },
            { key: "draft", label: "Borradores" },
            { key: "scheduled", label: "Programadas" },
            { key: "trash", label: "Papelera" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                statusFilter === key
                  ? key === "trash"
                    ? "bg-surface-card text-red-600 shadow-sm"
                    : "bg-surface-card text-heading shadow-sm"
                  : "text-muted hover:text-body"
              }`}
            >
              {label}
              <span className="ml-1.5 text-xs text-muted">{counts[key]}</span>
            </button>
          ))}
        </div>

        <div className="bg-surface-card rounded-xl border border-surface-border">
          {loading ? (
            <div className="p-6 text-center text-muted">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-muted">
              {isTrash
                ? "La papelera está vacía."
                : articles.length === 0
                ? "No hay noticias todavía."
                : "No hay noticias con estos filtros."}
            </div>
          ) : (
            <>
            {/* Mobile: cards */}
            <div className="md:hidden divide-y divide-surface-border">
              {filtered.map((article) => {
                const status = getStatus(article);
                return (
                  <div key={article.id} className="p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      {!isTrash && article.featured && (
                        <span className="text-amber-500 flex-shrink-0 mt-0.5">&#9733;</span>
                      )}
                      <Link
                        href={`/admin/noticias/${article.id}`}
                        className={`text-sm font-medium leading-snug ${
                          isTrash
                            ? "text-muted line-through"
                            : "text-heading hover:text-primary"
                        }`}
                      >
                        {article.title}
                      </Link>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {article.category && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: article.category.color }}
                        >
                          {article.category.name}
                        </span>
                      )}
                      {isTrash ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                          En papelera
                        </span>
                      ) : (
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            status === "scheduled"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                              : status === "published"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                          }`}
                        >
                          {status === "scheduled" ? "Programada" : status === "published" ? "Publicada" : "Borrador"}
                        </span>
                      )}
                      <span className="text-xs text-muted">{article.views} vistas</span>
                      <span className="text-xs text-muted">{formatDateShort(article.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-4 pt-1">
                      {isTrash ? (
                        <>
                          <button
                            onClick={() => handleRestore(article.id)}
                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                          >
                            Restaurar
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(article.id)}
                            className="text-sm text-red-500 hover:text-red-700 font-medium"
                          >
                            Eliminar definitivo
                          </button>
                        </>
                      ) : (
                        <>
                          <a
                            href={`/admin/preview/${article.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted hover:text-blue-500"
                          >
                            Preview
                          </a>
                          <Link
                            href={`/admin/noticias/${article.id}`}
                            className="text-sm text-muted hover:text-primary"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDuplicate(article.id)}
                            className="text-sm text-muted hover:text-blue-600"
                          >
                            Duplicar
                          </button>
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="text-sm text-muted hover:text-red-500"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: table */}
            <table className="w-full hidden md:table">
              <thead>
                <tr className="border-b border-surface-border text-left text-sm text-muted">
                  <th className="px-6 py-3 font-medium">Título</th>
                  <th className="px-6 py-3 font-medium">Categoría</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium">Vistas</th>
                  <th className="px-6 py-3 font-medium">Fecha</th>
                  <th className="px-6 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filtered.map((article) => {
                  const status = getStatus(article);
                  return (
                    <tr key={article.id} className="hover:bg-surface">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {!isTrash && article.featured && (
                            <span
                              className="text-amber-500 flex-shrink-0"
                              title="Destacada"
                            >
                              &#9733;
                            </span>
                          )}
                          <Link
                            href={`/admin/noticias/${article.id}`}
                            className={`text-sm font-medium ${
                              isTrash
                                ? "text-muted line-through"
                                : "text-heading hover:text-primary"
                            }`}
                          >
                            {article.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        {article.category && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: article.category.color }}
                          >
                            {article.category.name}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {isTrash ? (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                            En papelera
                          </span>
                        ) : (
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              status === "scheduled"
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                : status === "published"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                            }`}
                          >
                            {status === "scheduled"
                              ? "Programada"
                              : status === "published"
                              ? "Publicada"
                              : "Borrador"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm text-muted">
                        {article.views}
                      </td>
                      <td className="px-6 py-3 text-sm text-muted">
                        {formatDateShort(article.created_at)}
                      </td>
                      <td className="px-6 py-3">
                        {isTrash ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleRestore(article.id)}
                              className="text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                              Restaurar
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(article.id)}
                              className="text-sm text-red-500 hover:text-red-700 font-medium"
                            >
                              Eliminar definitivo
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <a
                              href={`/admin/preview/${article.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-muted hover:text-blue-500"
                            >
                              Preview
                            </a>
                            <Link
                              href={`/admin/noticias/${article.id}`}
                              className="text-sm text-muted hover:text-primary"
                            >
                              Editar
                            </Link>
                            <button
                              onClick={() => handleDuplicate(article.id)}
                              className="text-sm text-muted hover:text-blue-600"
                            >
                              Duplicar
                            </button>
                            <button
                              onClick={() => handleDelete(article.id)}
                              className="text-sm text-muted hover:text-red-500"
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
