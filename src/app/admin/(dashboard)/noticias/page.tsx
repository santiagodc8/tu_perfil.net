"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AdminHeader from "@/components/admin/AdminHeader";
import { formatDateShort } from "@/lib/utils";

interface ArticleRow {
  id: string;
  title: string;
  published: boolean;
  featured: boolean;
  views: number;
  created_at: string;
  category: { name: string; color: string } | null;
}

export default function NoticiasPage() {
  const supabase = createClient();
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchArticles() {
    const { data } = await supabase
      .from("articles")
      .select("id, title, published, featured, views, created_at, category:categories(name, color)")
      .order("created_at", { ascending: false })
      .returns<ArticleRow[]>();
    setArticles(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar esta noticia?")) return;
    await supabase.from("articles").delete().eq("id", id);
    fetchArticles();
  }

  return (
    <div>
      <AdminHeader title="Noticias" />
      <div className="p-6 space-y-4">
        <Link
          href="/admin/noticias/nueva"
          className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg transition"
        >
          + Nueva noticia
        </Link>

        <div className="bg-surface-card rounded-xl border border-surface-border">
          {loading ? (
            <div className="p-6 text-center text-muted">Cargando...</div>
          ) : articles.length === 0 ? (
            <div className="p-6 text-center text-muted">
              No hay noticias todavía.
            </div>
          ) : (
            <table className="w-full">
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
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-surface">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {article.featured && (
                          <span className="text-amber-500 flex-shrink-0" title="Destacada">&#9733;</span>
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
                          article.published
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {article.published ? "Publicada" : "Borrador"}
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
