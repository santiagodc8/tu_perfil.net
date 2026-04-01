"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminHeader from "@/components/admin/AdminHeader";
import { formatDateShort } from "@/lib/utils";
import type { Opinion } from "@/types";

type Tab = "pendientes" | "aprobadas";

export default function OpinionesPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("pendientes");
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOpinions() {
    setLoading(true);
    const { data } = await supabase
      .from("opinions")
      .select("*")
      .eq("approved", tab === "aprobadas")
      .order("created_at", { ascending: false })
      .returns<Opinion[]>();
    setOpinions(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchOpinions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function handleApprove(id: string) {
    await supabase.from("opinions").update({ approved: true }).eq("id", id);
    fetchOpinions();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta opinión?")) return;
    await supabase.from("opinions").delete().eq("id", id);
    fetchOpinions();
  }

  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    async function fetchPendingCount() {
      const { count } = await supabase
        .from("opinions")
        .select("id", { count: "exact", head: true })
        .eq("approved", false);
      setPendingCount(count ?? 0);
    }
    fetchPendingCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opinions]);

  return (
    <div>
      <AdminHeader title="Opiniones" />

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
            onClick={() => setTab("aprobadas")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === "aprobadas"
                ? "bg-primary text-white"
                : "bg-surface-card border border-surface-border text-body hover:bg-surface"
            }`}
          >
            Aprobadas
          </button>
        </div>

        {/* Lista */}
        <div className="bg-surface-card rounded-xl border border-surface-border">
          {loading ? (
            <div className="p-6 text-center text-muted">Cargando...</div>
          ) : opinions.length === 0 ? (
            <div className="p-6 text-center text-muted">
              {tab === "pendientes"
                ? "No hay opiniones pendientes."
                : "No hay opiniones aprobadas."}
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {opinions.map((opinion) => (
                <div key={opinion.id} className="px-6 py-4">
                  {/* Encabezado */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-heading">
                          {opinion.author_name}
                        </span>
                        <span className="text-xs text-muted">
                          {opinion.author_email}
                        </span>
                        <span className="text-xs text-muted">
                          · {formatDateShort(opinion.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {tab === "pendientes" && (
                        <button
                          onClick={() => handleApprove(opinion.id)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                        >
                          Aprobar
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(opinion.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Contenido */}
                  <p className="mt-2 text-sm text-body whitespace-pre-wrap line-clamp-4">
                    {opinion.content}
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
