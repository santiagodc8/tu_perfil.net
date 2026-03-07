"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-custom py-16 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Algo salió mal
      </h2>
      <p className="text-gray-500 mb-6">
        Ocurrió un error al cargar esta página.
      </p>
      <button
        onClick={reset}
        className="bg-accent hover:bg-accent-dark text-white font-semibold px-6 py-3 rounded-lg transition"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
