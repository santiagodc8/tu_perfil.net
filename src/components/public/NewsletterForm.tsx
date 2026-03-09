"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Error al suscribirte. Intentá de nuevo.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setErrorMsg("Error de conexión. Intentá de nuevo.");
      setStatus("error");
    }
  }

  return (
    <div className="bg-[#1A1A1A] rounded-xl p-6 sm:p-8">
      <h3 className="text-white font-bold text-lg mb-1">
        Suscribite a nuestro newsletter
      </h3>
      <p className="text-gray-400 text-sm mb-5">
        Recibí las noticias más importantes en tu email
      </p>

      {status === "success" ? (
        <div className="flex items-center gap-3 bg-green-900/30 border border-green-700/40 rounded-lg px-4 py-3">
          <span className="text-green-400 text-lg flex-shrink-0">✓</span>
          <p className="text-green-300 text-sm font-medium">
            ¡Suscripción exitosa! Pronto recibirás nuestras noticias.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder="tu@email.com"
              required
              disabled={status === "loading"}
              className="flex-1 min-w-0 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === "loading" || !email.trim()}
              className="flex-shrink-0 bg-primary hover:bg-[#FF1A2A] active:bg-[#B00510] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "..." : "Suscribirme"}
            </button>
          </div>

          {status === "error" && errorMsg && (
            <p className="text-red-400 text-xs mt-2">{errorMsg}</p>
          )}

          <p className="text-gray-600 text-xs mt-3">
            Sin spam. Podés cancelar cuando quieras.
          </p>
        </form>
      )}
    </div>
  );
}
