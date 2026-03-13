"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AdminHeader from "@/components/admin/AdminHeader";
import { formatDateShort } from "@/lib/utils";
import type { Category } from "@/types";

interface ArticleRow {
  id: string;
  title: string;
  published: boolean;
  published_at: string | null;
  featured: boolean;
  views: number;
  created_at: string;
  category: { name: string; color: string } | null;
}

type StatusFilter = "all" | "published" | "draft" | "scheduled";

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
          "id, title, published, published_at, featured, views, created_at, category:categories(name, color)"
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
    if (!confirm("¿Estás seguro de eliminar esta noticia?")) return;
    await supabase.from("articles").delete().eq("id", id);
    fetchData();
  }

  const filtered = articles.filter((a) => {
    if (statusFilter !== "all" && getStatus(a) !== statusFilter) return false;
    if (categoryFilter && a.category?.name !== categoryFilter) return false;
    return true;
  });

  const counts = {
    all: articles.length,
    published: articles.filter((a) => getStatus(a) === "published").length,
    draft: articles.filter((a) => getStatus(a) === "draft").length,
    scheduled: articles.filter((a) => getStatus(a) === "scheduled").length,
  };

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
        </div>

        {/* Tabs de estado */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto">
          {([
            { key: "all", label: "Todas" },
            { key: "published", label: "Publicadas" },
            { key: "draft", label: "Borradores" },
            { key: "scheduled", label: "Programadas" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                statusFilter === key
                  ? "bg-white text-heading shadow-sm"
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
              {articles.length === 0
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
                      {article.featured && (
                        <span className="text-amber-500 flex-shrink-0 mt-0.5">&#9733;</span>
                      )}
                      <Link
                        href={`/admin/noticias/${article.id}`}
                        className="text-sm font-medium text-heading hover:text-primary leading-snug"
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
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          status === "scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {status === "scheduled" ? "Programada" : status === "published" ? "Publicada" : "Borrador"}
                      </span>
                      <span className="text-xs text-muted">{article.views} vistas</span>
                      <span className="text-xs text-muted">{formatDateShort(article.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-4 pt-1">
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
                        onClick={() => handleDelete(article.id)}
                        className="text-sm text-muted hover:text-red-500"
                      >
                        Eliminar
                      </button>
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
                          {article.featured && (
                            <span
                              className="text-amber-500 flex-shrink-0"
                              title="Destacada"
                            >
                              &#9733;
                            </span>
                          )}
                          <Link
                            href={`/admin/noticias/${article.id}`}
                            className="text-sm font-medium text-heading hover:text-primary"
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
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            status === "scheduled"
                              ? "bg-blue-100 text-blue-700"
                              : status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {status === "scheduled"
                            ? "Programada"
                            : status === "published"
                            ? "Publicada"
                            : "Borrador"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-muted">
                        {article.views}
                      </td>
                      <td className="px-6 py-3 text-sm text-muted">
                        {formatDateShort(article.created_at)}
                      </td>
                      <td className="px-6 py-3">
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
                            onClick={() => handleDelete(article.id)}
                            className="text-sm text-muted hover:text-red-500"
                          >
                            Eliminar
                          </button>
                        </div>
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
