import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="text-center">
        <h1 className="text-6xl sm:text-7xl font-extrabold text-primary mb-4">404</h1>
        <p className="text-lg sm:text-xl text-body mb-6">
          La página que buscas no existe
        </p>
        <Link
          href="/"
          className="inline-block bg-primary hover:bg-primary-hover active:bg-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
