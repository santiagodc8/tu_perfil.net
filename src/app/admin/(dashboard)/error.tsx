"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Error
      </h2>
      <p className="text-gray-500 mb-4">
        Ocurrió un error. Intenta de nuevo.
      </p>
      <button
        onClick={reset}
        className="bg-accent hover:bg-accent-dark text-white font-semibold px-6 py-2.5 rounded-lg transition"
      >
        Reintentar
      </button>
    </div>
  );
}
