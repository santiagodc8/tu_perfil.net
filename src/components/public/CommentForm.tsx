"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

interface CommentFormProps {
  articleId: string;
}

export default function CommentForm({ articleId }: CommentFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const fieldErrors: Record<string, string> = {};
  if (touched.name && !name.trim()) fieldErrors.name = "El nombre es obligatorio.";
  if (touched.email && !email.trim()) fieldErrors.email = "El email es obligatorio.";
  else if (touched.email && !emailRegex.test(email.trim())) fieldErrors.email = "El email no es válido.";
  if (touched.content && !content.trim()) fieldErrors.content = "El comentario es obligatorio.";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validación cliente
    setTouched({ name: true, email: true, content: true });
    if (!name.trim() || !email.trim() || !content.trim()) {
      setError("Todos los campos son requeridos.");
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setError("El email no es válido.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          article_id: articleId,
          author_name: name.trim(),
          author_email: email.trim(),
          content: content.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Ocurrió un error. Intenta de nuevo.");
        return;
      }

      setSuccess(true);
      trackEvent("comment_submit", { article_id: articleId });
      setName("");
      setEmail("");
      setContent("");
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/30 rounded-xl p-5 text-center">
        <p className="text-green-700 dark:text-green-300 font-medium text-sm">
          Tu comentario fue enviado y será publicado luego de ser aprobado.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-3 text-xs text-green-600 dark:text-green-400 underline hover:no-underline"
        >
          Escribir otro comentario
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="comment-name" className="block text-xs font-semibold text-body mb-1">
            Nombre <span className="text-primary">*</span>
          </label>
          <input
            id="comment-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            placeholder="Tu nombre"
            maxLength={100}
            className={`w-full border bg-surface-card rounded-lg px-3 py-2 text-sm text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${
              fieldErrors.name ? "border-red-400" : "border-surface-border"
            }`}
          />
          {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
        </div>
        <div>
          <label htmlFor="comment-email" className="block text-xs font-semibold text-body mb-1">
            Email <span className="text-primary">*</span>
          </label>
          <input
            id="comment-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            placeholder="tu@email.com"
            maxLength={200}
            className={`w-full border bg-surface-card rounded-lg px-3 py-2 text-sm text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${
              fieldErrors.email ? "border-red-400" : "border-surface-border"
            }`}
          />
          {fieldErrors.email ? (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
          ) : (
            <p className="mt-1 text-xs text-muted">No será publicado.</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="comment-content" className="block text-xs font-semibold text-body mb-1">
          Comentario <span className="text-primary">*</span>
        </label>
        <textarea
          id="comment-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, content: true }))}
          placeholder="Escribe tu comentario..."
          rows={4}
          maxLength={2000}
          className={`w-full border bg-surface-card rounded-lg px-3 py-2 text-sm text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none ${
            fieldErrors.content ? "border-red-400" : "border-surface-border"
          }`}
        />
        {fieldErrors.content && <p className="text-xs text-red-500 mt-1">{fieldErrors.content}</p>}
        <p className="text-xs text-muted text-right mt-0.5">{content.length}/2000</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition"
      >
        {submitting ? "Enviando..." : "Enviar comentario"}
      </button>
    </form>
  );
}
