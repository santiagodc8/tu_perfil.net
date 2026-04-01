"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-6">
          <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
          <h2 className="text-2xl font-bold mb-2">Error del servidor</h2>
          <p className="text-gray-600 mb-6">
            Ocurrio un error inesperado. Por favor intenta de nuevo.
          </p>
          <button
            onClick={() => reset()}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
