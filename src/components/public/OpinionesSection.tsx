"use client";

import { useState, useEffect } from "react";
import { smartDateShort } from "@/lib/utils";

interface ApprovedOpinion {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export default function OpinionesSection() {
  const [opinions, setOpinions] = useState<ApprovedOpinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/opinions")
      .then((r) => r.json())
      .then((res) => setOpinions(res.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setMessage(null);

    try {
      const res = await fetch("/api/opinions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: name,
          author_email: email,
          content,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "ok", text: "¡Gracias! Tu opinión será revisada antes de publicarse." });
        setName("");
        setEmail("");
        setContent("");
      } else {
        setMessage({ type: "error", text: data.error || "Error al enviar" });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setSending(false);
    }
  }

  return (
    <section>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <span className="w-1.5 h-8 sm:h-10 rounded-full bg-primary" />
        <div>
          <h2 className="font-display text-display-sm sm:text-display-md text-heading tracking-tight">
            Opiniones
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            Comparte tu opinión con la comunidad
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="bg-surface-card rounded-card border border-surface-border p-5 sm:p-6">
          <h3 className="text-base font-semibold text-heading mb-4">
            Deja tu opinión
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                className="w-full px-4 py-2.5 rounded-lg bg-surface border border-surface-border text-body text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
              <input
                type="email"
                placeholder="Tu email (no se publica)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-surface border border-surface-border text-body text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
            <textarea
              placeholder="Escribe tu opinión..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              minLength={10}
              maxLength={1000}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg bg-surface border border-surface-border text-body text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
            />
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted">
                {content.length}/1000
              </span>
              <button
                type="submit"
                disabled={sending}
                className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition disabled:opacity-50"
              >
                {sending ? "Enviando..." : "Enviar opinión"}
              </button>
            </div>
          </form>
          {message && (
            <div
              className={`mt-4 text-sm px-4 py-3 rounded-lg ${
                message.type === "ok"
                  ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        {/* Opiniones aprobadas */}
        <div>
          {loading ? (
            <div className="text-center text-muted py-8">Cargando opiniones...</div>
          ) : opinions.length === 0 ? (
            <div className="text-center text-muted py-8 bg-surface-card rounded-card border border-surface-border">
              Aún no hay opiniones publicadas. ¡Sé el primero!
            </div>
          ) : (
            <div className="space-y-3">
              {opinions.map((opinion) => (
                <div
                  key={opinion.id}
                  className="bg-surface-card rounded-card border border-surface-border p-4 sm:p-5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                      {opinion.author_name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-heading block truncate">
                        {opinion.author_name}
                      </span>
                      <span className="text-[11px] text-muted">
                        {smartDateShort(opinion.created_at)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-body whitespace-pre-wrap leading-relaxed">
                    {opinion.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
