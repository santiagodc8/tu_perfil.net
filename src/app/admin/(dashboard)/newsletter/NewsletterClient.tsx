"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminHeader from "@/components/admin/AdminHeader";

type SendStatus = "idle" | "sending" | "success" | "error";

export default function NewsletterClient() {
  const supabase = createClient();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [resultMsg, setResultMsg] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    async function fetchCount() {
      const { count } = await supabase
        .from("subscribers")
        .select("*", { count: "exact", head: true })
        .eq("active", true);
      setActiveCount(count ?? 0);
      setLoadingCount(false);
    }
    fetchCount();
  }, [supabase]);

  async function handleSend() {
    setShowConfirm(false);
    setSendStatus("sending");
    setResultMsg("");

    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), body: body.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResultMsg(data.error ?? "Error al enviar el newsletter.");
        setSendStatus("error");
        return;
      }

      setResultMsg(
        `Newsletter enviado correctamente a ${data.sent} suscriptor${data.sent === 1 ? "" : "es"}.${
          data.failed > 0 ? ` (${data.failed} fallaron)` : ""
        }`
      );
      setSendStatus("success");
      setSubject("");
      setBody("");
    } catch {
      setResultMsg("Error de conexión. Intenta de nuevo.");
      setSendStatus("error");
    }
  }

  const canSend =
    subject.trim().length > 0 &&
    body.trim().length > 0 &&
    (activeCount ?? 0) > 0 &&
    sendStatus !== "sending";

  return (
    <div>
      <AdminHeader title="Enviar Newsletter" />
      <div className="p-4 md:p-6 max-w-2xl space-y-6">

        {/* Subscriber count info */}
        <div className="bg-surface-card rounded-xl border border-surface-border px-6 py-4 flex items-center gap-4">
          <div className="text-3xl font-bold text-primary">
            {loadingCount ? "—" : (activeCount ?? 0)}
          </div>
          <div>
            <div className="text-sm font-medium text-heading">
              Suscriptores activos
            </div>
            <div className="text-xs text-muted">
              {loadingCount
                ? "Cargando..."
                : activeCount === 0
                ? "No hay suscriptores activos todavía"
                : "El newsletter se enviará a estas personas"}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-surface-card rounded-xl border border-surface-border p-6 space-y-5">
          <div>
            <label
              htmlFor="nl-subject"
              className="block text-sm font-medium text-body mb-1"
            >
              Asunto del email
            </label>
            <input
              id="nl-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ej: Resumen semanal de noticias — TuPerfil.net"
              maxLength={150}
              disabled={sendStatus === "sending"}
              className="w-full px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm disabled:opacity-50"
            />
            <p className="text-xs text-muted mt-1">
              {subject.length}/150 caracteres
            </p>
          </div>

          <div>
            <label
              htmlFor="nl-body"
              className="block text-sm font-medium text-body mb-1"
            >
              Contenido del newsletter
            </label>
            <textarea
              id="nl-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Escribe el contenido del newsletter. Puedes usar saltos de línea para separar párrafos."
              rows={12}
              disabled={sendStatus === "sending"}
              className="w-full px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm resize-y disabled:opacity-50"
            />
            <p className="text-xs text-muted mt-1">
              Los saltos de línea se respetan en el email.
            </p>
          </div>

          {/* Preview + Send buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              disabled={!subject.trim() || !body.trim()}
              className="px-5 py-2.5 rounded-lg border border-surface-border text-body font-medium text-sm hover:border-primary hover:text-primary transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Vista previa
            </button>
          </div>

          {/* Preview modal */}
          {showPreview && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-surface-border px-6 py-4 flex items-center justify-between">
                  <h3 className="font-bold text-heading">Vista previa del email</h3>
                  <button onClick={() => setShowPreview(false)} className="text-muted hover:text-heading transition">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6">
                  <div className="mb-4 pb-4 border-b border-surface-border">
                    <p className="text-xs text-muted mb-1">Asunto:</p>
                    <p className="font-semibold text-heading">{subject}</p>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {body.split("\n").map((line, i) => (
                      <p key={i}>{line || <br />}</p>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-surface-border text-center text-xs text-muted">
                    <p>TuPerfil.net — Noticias que importan</p>
                    <p className="mt-1 underline">Cancelar suscripción</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Send button */}
          {showConfirm ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                ¿Confirmas el envío a{" "}
                <strong>{activeCount} suscriptor{activeCount === 1 ? "" : "es"}</strong>?
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleSend}
                  disabled={sendStatus === "sending"}
                  className="bg-primary hover:bg-[#FF1A2A] text-white font-semibold px-5 py-2 rounded-lg text-sm transition disabled:opacity-50"
                >
                  Sí, enviar ahora
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="bg-surface border border-surface-border text-body font-medium px-5 py-2 rounded-lg text-sm hover:border-gray-400 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={!canSend}
              className="w-full bg-primary hover:bg-[#FF1A2A] active:bg-[#B00510] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {sendStatus === "sending"
                ? "Enviando..."
                : `Enviar newsletter a ${activeCount ?? "—"} suscriptor${activeCount === 1 ? "" : "es"}`}
            </button>
          )}

          {/* Result message */}
          {sendStatus === "success" && resultMsg && (
            <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/30 rounded-lg px-4 py-3">
              <span className="text-green-500 font-bold flex-shrink-0">✓</span>
              <p className="text-green-700 dark:text-green-300 text-sm">{resultMsg}</p>
            </div>
          )}
          {sendStatus === "error" && resultMsg && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-lg px-4 py-3">
              <span className="text-red-500 font-bold flex-shrink-0">✕</span>
              <p className="text-red-700 dark:text-red-300 text-sm">{resultMsg}</p>
            </div>
          )}
        </div>

        {/* Preview hint */}
        <div className="bg-surface rounded-xl border border-surface-border p-4">
          <p className="text-xs text-muted leading-relaxed">
            <strong className="text-body">Nota:</strong> Cada email incluye
            automáticamente un enlace de cancelación de suscripción al pie. Se
            envía desde{" "}
            <code className="bg-surface-border px-1 py-0.5 rounded text-xs">
              {process.env.NEXT_PUBLIC_FROM_EMAIL ?? "noticias@tuperfil.net"}
            </code>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
