"use client";

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
    // Dispatch event so Analytics component can react
    window.dispatchEvent(new Event("cookie_consent_change"));
  }

  function reject() {
    localStorage.setItem("cookie_consent", "rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6">
      <div className="max-w-xl mx-auto bg-surface-card border border-surface-border rounded-xl shadow-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <p className="text-sm text-body flex-1">
          Usamos cookies para mejorar tu experiencia y analizar el tráfico del
          sitio.{" "}
          <a
            href="/politica-de-privacidad"
            className="text-primary hover:underline"
          >
            Más información
          </a>
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={reject}
            className="px-4 py-2 text-sm font-medium text-muted hover:text-body border border-surface-border rounded-lg transition"
          >
            Rechazar
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
