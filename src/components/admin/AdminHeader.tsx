import Link from "next/link";

export default function AdminHeader({ title }: { title: string }) {
  return (
    <header className="bg-surface-card border-b border-surface-border px-6 py-4 flex items-center justify-between">
      <h2 className="text-xl font-bold text-heading">{title}</h2>
      <Link
        href="/"
        target="_blank"
        className="text-sm text-muted hover:text-primary transition"
      >
        Ver sitio →
      </Link>
    </header>
  );
}
