"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Inicio", icon: "🏠" },
  { href: "/admin/noticias", label: "Noticias", icon: "📰" },
  { href: "/admin/categorias", label: "Categorías", icon: "📂" },
  { href: "/admin/etiquetas", label: "Etiquetas", icon: "🏷️" },
  { href: "/admin/ultima-hora", label: "Última Hora", icon: "🚨" },
  { href: "/admin/comentarios", label: "Comentarios", icon: "💬", badge: "pendingComments" },
  { href: "/admin/mensajes", label: "Mensajes", icon: "✉️" },
  { href: "/admin/publicidad", label: "Publicidad", icon: "📢" },
  { href: "/admin/estadisticas", label: "Estadísticas", icon: "📊" },
  { href: "/admin/suscriptores", label: "Suscriptores", icon: "👥", adminOnly: true },
  { href: "/admin/newsletter", label: "Newsletter", icon: "📧", adminOnly: true },
  { href: "/admin/usuarios", label: "Usuarios", icon: "👤", adminOnly: true },
];

export default function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [pendingComments, setPendingComments] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchPending() {
      const { count } = await supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("approved", false);
      setPendingComments(count ?? 0);
    }
    fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const badges: Record<string, number> = { pendingComments };

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || role === "admin"
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-40 md:hidden bg-surface-header text-white p-2 rounded-lg shadow-lg"
        aria-label="Abrir menú"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-surface-header min-h-screen flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:transition-none
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 md:hidden text-gray-400 hover:text-white p-1"
          aria-label="Cerrar menú"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <Link href="/admin" className="block">
            <Image
              src="/tuperfil_logo_recortado.png"
              alt="TuPerfil.net"
              width={200}
              height={60}
              className="h-12 w-auto mb-1"
            />
            <span className="text-xs text-silver">Panel de Administración</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            const badgeCount = item.badge ? (badges[item.badge] ?? 0) : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {badgeCount > 0 && (
                  <span className="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          {role === "editor" && (
            <div className="px-4 py-2 mb-1">
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md">
                Rol: Editor
              </span>
            </div>
          )}
          <Link
            href="/admin/perfil"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              pathname === "/admin/perfil"
                ? "bg-white/10 text-white"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>⚙️</span>
            Mi perfil
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition w-full"
          >
            <span>🚪</span>
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
