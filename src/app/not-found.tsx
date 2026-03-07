import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-7xl font-extrabold text-primary mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">
          La página que buscas no existe
        </p>
        <Link
          href="/"
          className="inline-block bg-accent hover:bg-accent-dark text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
