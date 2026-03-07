"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ContactoPage() {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");

    const { error: dbError } = await supabase
      .from("contacts")
      .insert({ name: name.trim(), email: email.trim(), message: message.trim() });

    if (dbError) {
      setError("Error al enviar el mensaje. Intenta de nuevo.");
      setSending(false);
      return;
    }

    setSent(true);
    setSending(false);
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
        <h1 className="text-3xl font-extrabold text-heading mb-2">
          Contacto
        </h1>
        <p className="text-muted mb-8">
          ¿Tienes alguna pregunta o sugerencia? Escríbenos.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
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
              required
              className="w-full px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Tu nombre"
            />
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
              required
              className="w-full px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-body mb-1">
              Mensaje
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              className="w-full px-4 py-2.5 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
              placeholder="Escribe tu mensaje..."
            />
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
