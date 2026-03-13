import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sin conexión",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="text-2xl font-extrabold text-heading mb-2">
          Sin conexión a internet
        </h1>
        <p className="text-muted mb-6">
          No pudimos cargar esta página. Revisá tu conexión e intentá de nuevo.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
