"use client";

import { useState } from "react";
import Breadcrumbs from "@/components/public/Breadcrumbs";

export default function ContactoPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validationErrors: Record<string, string> = {};
  if (touched.name && !name.trim()) validationErrors.name = "El nombre es obligatorio.";
  if (touched.email && !email.trim()) validationErrors.email = "El email es obligatorio.";
  else if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    validationErrors.email = "El email no es válido.";
  if (touched.message && !message.trim()) validationErrors.message = "El mensaje es obligatorio.";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al enviar el mensaje. Intenta de nuevo.");
        setSending(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Error de conexión. Verifica tu internet e intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-heading mb-2">
            Mensaje enviado
          </h1>
          <p className="text-muted">
            Gracias por contactarnos. Te responderemos lo antes posible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-6">
      <div className="max-w-lg mx-auto">
        <div className="mb-4">
          <Breadcrumbs items={[{ label: "Contacto" }]} />
        </div>

        <h1 className="text-3xl font-extrabold text-heading mb-2">
          Contacto
        </h1>
        <p className="text-muted mb-8">
          ¿Tienes alguna pregunta o sugerencia? Escríbenos.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg border border-red-200 dark:border-red-700/30">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-body mb-1">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              required
              className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-surface-card focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
                validationErrors.name ? "border-red-400" : "border-surface-border"
              }`}
              placeholder="Tu nombre"
            />
            {validationErrors.name && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-body mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              required
              className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-surface-card focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
                validationErrors.email ? "border-red-400" : "border-surface-border"
              }`}
              placeholder="tu@email.com"
            />
            {validationErrors.email && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-body mb-1">
              Mensaje
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, message: true }))}
              required
              rows={5}
              className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-surface-card focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none ${
                validationErrors.message ? "border-red-400" : "border-surface-border"
              }`}
              placeholder="Escribe tu mensaje..."
            />
            {validationErrors.message && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-primary hover:bg-primary-hover active:bg-primary-dark text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {sending ? "Enviando..." : "Enviar mensaje"}
          </button>
        </form>
      </div>
    </div>
  );
}
