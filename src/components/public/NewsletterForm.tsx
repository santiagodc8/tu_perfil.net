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
    <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] rounded-2xl p-6 sm:p-8 border border-white/[0.06]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="sm:max-w-md">
          <h3 className="font-display text-white text-xl sm:text-2xl mb-1">
            Suscribite al newsletter
          </h3>
          <p className="text-gray-500 text-sm">
            Recibí las noticias más importantes en tu email
          </p>
        </div>

        <div className="sm:min-w-[340px]">
          {status === "success" ? (
            <div className="flex items-center gap-3 bg-green-900/20 border border-green-700/30 rounded-xl px-4 py-3">
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
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 disabled:opacity-50 transition"
                />
                <button
                  type="submit"
                  disabled={status === "loading" || !email.trim()}
                  className="flex-shrink-0 bg-primary hover:bg-primary-hover active:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
                >
                  {status === "loading" ? "..." : "Suscribirme"}
                </button>
              </div>

              {status === "error" && errorMsg && (
                <p className="text-red-400 text-xs mt-2">{errorMsg}</p>
              )}

              <p className="text-gray-700 text-xs mt-3">
                Sin spam. Podés cancelar cuando quieras.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
