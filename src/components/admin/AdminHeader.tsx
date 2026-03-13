import Link from "next/link";

export default function AdminHeader({ title }: { title: string }) {
  return (
    <header className="bg-surface-card border-b border-surface-border px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
      {/* Left spacer for mobile hamburger */}
      <div className="w-8 md:hidden" />
      <h2 className="text-lg md:text-xl font-bold text-heading truncate">{title}</h2>
      <Link
        href="/"
        target="_blank"
        className="text-sm text-muted hover:text-primary transition flex-shrink-0"
      >
        Ver sitio →
      </Link>
    </header>
  );
}
