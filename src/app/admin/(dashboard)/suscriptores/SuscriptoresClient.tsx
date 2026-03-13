"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminHeader from "@/components/admin/AdminHeader";
import { formatDateShort } from "@/lib/utils";
import type { Subscriber } from "@/types";

export default function SuscriptoresClient() {
  const supabase = createClient();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  async function fetchSubscribers() {
    const { data } = await supabase
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    setSubscribers(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchSubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeSubscribers = subscribers.filter((s) => s.active);
  const inactiveSubscribers = subscribers.filter((s) => !s.active);

  async function handleCopyEmails() {
    const emails = activeSubscribers.map((s) => s.email).join("\n");
    try {
      await navigator.clipboard.writeText(emails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for browsers that block clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = emails;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  async function handleDeactivate(id: string, email: string) {
    if (!confirm(`¿Dar de baja a ${email}?`)) return;
    await supabase
      .from("subscribers")
      .update({ active: false, unsubscribed_at: new Date().toISOString() })
      .eq("id", id);
    fetchSubscribers();
  }

  async function handleReactivate(id: string) {
    await supabase
      .from("subscribers")
      .update({ active: true, unsubscribed_at: null })
      .eq("id", id);
    fetchSubscribers();
  }

  return (
    <div>
      <AdminHeader title="Suscriptores" />
      <div className="p-4 md:p-6 space-y-6">

        {/* Stats */}
        <div className="flex flex-wrap gap-4">
          <div className="bg-surface-card rounded-xl border border-surface-border px-6 py-4 flex items-center gap-4">
            <div className="text-3xl font-bold text-primary">
              {loading ? "—" : activeSubscribers.length}
            </div>
            <div>
              <div className="text-sm font-medium text-heading">Activos</div>
              <div className="text-xs text-muted">Recibirán el próximo envío</div>
            </div>
          </div>
          <div className="bg-surface-card rounded-xl border border-surface-border px-6 py-4 flex items-center gap-4">
            <div className="text-3xl font-bold text-gray-400">
              {loading ? "—" : inactiveSubscribers.length}
            </div>
            <div>
              <div className="text-sm font-medium text-heading">Inactivos</div>
              <div className="text-xs text-muted">Se dieron de baja</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {!loading && activeSubscribers.length > 0 && (
          <div>
            <button
              onClick={handleCopyEmails}
              className="flex items-center gap-2 bg-surface-card border border-surface-border hover:border-primary hover:text-primary text-body font-medium px-4 py-2.5 rounded-lg text-sm transition"
            >
              <span>{copied ? "✓" : "📋"}</span>
              {copied
                ? "¡Copiado!"
                : `Copiar ${activeSubscribers.length} emails activos`}
            </button>
            <p className="text-xs text-muted mt-1.5">
              Copia todos los emails activos al portapapeles (separados por línea)
            </p>
          </div>
        )}

        {/* Subscribers list */}
        <div className="bg-surface-card rounded-xl border border-surface-border">
          {loading ? (
            <div className="p-6 text-center text-muted">Cargando...</div>
          ) : subscribers.length === 0 ? (
            <div className="p-6 text-center text-muted">
              Todavía no hay suscriptores.
            </div>
          ) : (
            <div>
              {/* Active */}
              {activeSubscribers.length > 0 && (
                <>
                  <div className="px-6 py-3 bg-surface rounded-t-xl border-b border-surface-border">
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                      Activos ({activeSubscribers.length})
                    </span>
                  </div>
                  <div className="divide-y divide-surface-border">
                    {activeSubscribers.map((sub) => (
                      <div
                        key={sub.id}
                        className="px-6 py-3 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                            <span className="text-sm font-medium text-heading truncate">
                              {sub.email}
                            </span>
                            {sub.name && (
                              <span className="text-xs text-muted">
                                ({sub.name})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted mt-0.5 pl-4">
                            Suscripto el {formatDateShort(sub.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleDeactivate(sub.id, sub.email)
                          }
                          className="text-xs text-muted hover:text-red-500 flex-shrink-0 transition"
                        >
                          Dar de baja
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Inactive */}
              {inactiveSubscribers.length > 0 && (
                <>
                  <div
                    className={`px-6 py-3 bg-surface border-b border-surface-border ${
                      activeSubscribers.length > 0 ? "border-t" : "rounded-t-xl"
                    }`}
                  >
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                      Inactivos ({inactiveSubscribers.length})
                    </span>
                  </div>
                  <div className="divide-y divide-surface-border">
                    {inactiveSubscribers.map((sub) => (
                      <div
                        key={sub.id}
                        className="px-6 py-3 flex items-center justify-between gap-4 opacity-60"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0" />
                            <span className="text-sm text-body truncate line-through">
                              {sub.email}
                            </span>
                          </div>
                          <p className="text-xs text-muted mt-0.5 pl-4">
                            Baja el{" "}
                            {sub.unsubscribed_at
                              ? formatDateShort(sub.unsubscribed_at)
                              : "—"}
                          </p>
                        </div>
                        <button
                          onClick={() => handleReactivate(sub.id)}
                          className="text-xs text-muted hover:text-green-600 flex-shrink-0 transition opacity-100"
                        >
                          Reactivar
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
