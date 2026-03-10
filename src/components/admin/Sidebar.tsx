"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin", label: "Inicio", icon: "🏠" },
  { href: "/admin/noticias", label: "Noticias", icon: "📰" },
  { href: "/admin/categorias", label: "Categorías", icon: "📂" },
  { href: "/admin/etiquetas", label: "Etiquetas", icon: "🏷️" },
  { href: "/admin/ultima-hora", label: "Última Hora", icon: "🚨" },
  { href: "/admin/comentarios", label: "Comentarios", icon: "💬", badge: "pendingComments" },
  { href: "/admin/mensajes", label: "Mensajes", icon: "✉️" },
  { href: "/admin/suscriptores", label: "Suscriptores", icon: "👥" },
  { href: "/admin/newsletter", label: "Newsletter", icon: "📧" },
  { href: "/admin/estadisticas", label: "Estadísticas", icon: "📊" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [pendingComments, setPendingComments] = useState(0);

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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const badges: Record<string, number> = { pendingComments };

  return (
    <aside className="w-64 bg-surface-header min-h-screen flex flex-col">
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

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
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

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition w-full"
        >
          <span>🚪</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
