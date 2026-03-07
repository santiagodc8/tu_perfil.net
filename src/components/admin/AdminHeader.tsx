import Link from "next/link";

export default function AdminHeader({ title }: { title: string }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <Link
        href="/"
        target="_blank"
        className="text-sm text-gray-500 hover:text-accent transition"
      >
        Ver sitio →
      </Link>
    </header>
  );
}
