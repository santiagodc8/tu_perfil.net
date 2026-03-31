"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AdminHeader from "@/components/admin/AdminHeader";
import { formatDateShort } from "@/lib/utils";
import type { Comment } from "@/types";

type CommentWithArticle = Comment & {
  article: { title: string; slug: string } | null;
};

type Tab = "pendientes" | "aprobados";

export default function ComentariosPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("pendientes");
  const [comments, setComments] = useState<CommentWithArticle[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchComments() {
    setLoading(true);
    const { data } = await supabase
      .from("comments")
      .select("*, article:articles(title, slug)")
      .eq("approved", tab === "aprobados")
      .order("created_at", { ascending: false })
      .returns<CommentWithArticle[]>();
    setComments(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function handleApprove(id: string) {
    await supabase.from("comments").update({ approved: true }).eq("id", id);
    fetchComments();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este comentario?")) return;
    await supabase.from("comments").delete().eq("id", id);
    fetchComments();
  }

  // Contar pendientes para mostrar en tabs
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    async function fetchPendingCount() {
      const { count } = await supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("approved", false);
      setPendingCount(count ?? 0);
    }
    fetchPendingCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]);

  return (
    <div>
      <AdminHeader title="Comentarios" />

      <div className="p-4 md:p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("pendientes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === "pendientes"
                ? "bg-primary text-white"
                : "bg-surface-card border border-surface-border text-body hover:bg-surface"
            }`}
          >
            Pendientes
            {pendingCount > 0 && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  tab === "pendientes"
                    ? "bg-white/20 text-white"
                    : "bg-primary text-white"
                }`}
              >
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("aprobados")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === "aprobados"
                ? "bg-primary text-white"
                : "bg-surface-card border border-surface-border text-body hover:bg-surface"
            }`}
          >
            Aprobados
          </button>
        </div>

        {/* Lista */}
        <div className="bg-surface-card rounded-xl border border-surface-border">
          {loading ? (
            <div className="p-6 text-center text-muted">Cargando...</div>
          ) : comments.length === 0 ? (
            <div className="p-6 text-center text-muted">
              {tab === "pendientes"
                ? "No hay comentarios pendientes."
                : "No hay comentarios aprobados."}
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {comments.map((comment) => (
                <div key={comment.id} className="px-6 py-4">
                  {/* Encabezado */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-heading">
                          {comment.author_name}
                        </span>
                        <span className="text-xs text-muted">
                          {comment.author_email}
                        </span>
                        <span className="text-xs text-muted">
                          · {formatDateShort(comment.created_at)}
                        </span>
                      </div>

                      {/* Artículo */}
                      {comment.article && (
                        <div className="mt-0.5">
                          <Link
                            href={`/noticia/${comment.article.slug}`}
                            target="_blank"
                            className="text-xs text-primary hover:underline"
                          >
                            {comment.article.title}
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {tab === "pendientes" && (
                        <button
                          onClick={() => handleApprove(comment.id)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                        >
                          Aprobar
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Contenido */}
                  <p className="mt-2 text-sm text-body whitespace-pre-wrap line-clamp-4">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
