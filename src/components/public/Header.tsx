"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";
import ThemeToggle from "./ThemeToggle";

// Slugs (o keywords) de categorías visibles por defecto en el nav
const VISIBLE_KEYWORDS = [
  "muy-personal",
  "politico",
  "nacional",
  "internacional",
  "educacion",
  "cultural",
  "salud",
  "deportivo",
];

function isVisibleCategory(slug: string) {
  return VISIBLE_KEYWORDS.some((kw) => slug.includes(kw));
}

export default function Header({ categories }: { categories: Category[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const visibleCategories = categories.filter((c) => isVisibleCategory(c.slug));
  const hiddenCategories = categories.filter((c) => !isVisibleCategory(c.slug));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  // Close "Más" dropdown on outside click
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-more-menu]")) setMoreOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [moreOpen]);

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const shortDate = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40">
      {/* Top accent line */}
      <div className="h-[3px] bg-gradient-to-r from-primary via-primary-hover to-primary" />

      {/* Main header */}
      <div
        className={`bg-surface-header text-white transition-shadow duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          scrolled ? "shadow-header" : ""
        }`}
      >
        <div className="container-custom py-3 sm:py-4 flex items-center justify-between gap-4">
          {/* Left: date */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <svg
              className="w-3.5 h-3.5 text-primary flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="hidden sm:inline text-xs text-gray-400 capitalize whitespace-nowrap tracking-wide">
              {today}
            </span>
            <span className="sm:hidden text-[11px] text-gray-400 capitalize truncate tracking-wide">
              {shortDate}
            </span>
          </div>

          {/* Center: logo */}
          <Link href="/" className="flex-shrink-0 relative group">
            <Image
              src="/logo_sin_fondo_ok.png"
              alt="TuPerfil.net"
              width={400}
              height={120}
              className="h-10 w-auto sm:hidden transition-opacity group-hover:opacity-90"
              priority
            />
            <Image
              src="/logo_sin_fondo_ok.png"
              alt="TuPerfil.net"
              width={600}
              height={180}
              className="hidden sm:block h-20 w-auto transition-opacity group-hover:opacity-90"
              priority
            />
          </Link>

          {/* Right side */}
          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3">
            {/* Emisora */}
            <a
              href="https://laquetegusta.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center gap-2 sm:gap-2.5 pl-1.5 pr-3 sm:pl-2 sm:pr-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-purple-600/20 via-orange-500/15 to-yellow-500/10 hover:from-purple-600/30 hover:via-orange-500/25 hover:to-yellow-500/20 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300 group hover:scale-[1.03] active:scale-[0.98]"
              title="Escuchar La Que Te Gusta"
            >
              {/* Glow effect */}
              <span className="absolute inset-0 rounded-full bg-purple-500/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Logo */}
              <span className="relative flex-shrink-0">
                <Image
                  src="/emisora.png"
                  alt="La Que Te Gusta"
                  width={40}
                  height={40}
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-full ring-2 ring-purple-400/30 group-hover:ring-purple-400/60 transition-all duration-300"
                />
                {/* Live pulse dot */}
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-400 border border-green-500" />
                </span>
              </span>

              {/* Text */}
              <span className="relative flex flex-col leading-none">
                <span className="text-[10px] sm:text-[11px] font-bold text-white/90 group-hover:text-white tracking-wide uppercase transition-colors">
                  En vivo
                </span>
                <span className="hidden sm:block text-[10px] text-purple-300/70 group-hover:text-purple-300 font-medium tracking-wider transition-colors mt-0.5">
                  La Que Te Gusta
                </span>
              </span>
            </a>

            {/* Theme toggle */}
            <ThemeToggle variant="dark-bg" />

            {/* Desktop search */}
            <form action="/buscar" className="hidden md:flex items-center">
              <div className="relative flex items-center">
                <input
                  name="q"
                  type="text"
                  placeholder="Buscar noticias..."
                  className="px-4 py-2 pr-10 rounded-full bg-white/[0.06] border border-white/[0.08] text-white placeholder-gray-500 text-sm focus:outline-none focus:bg-white/[0.1] focus:border-primary/50 w-48 lg:w-56 transition-all focus:w-60 lg:focus:w-72"
                />
                <button
                  type="submit"
                  className="absolute right-1 p-1.5 text-gray-400 hover:text-primary transition rounded-full cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </form>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 -mr-2 text-gray-300 hover:text-white active:bg-white/10 rounded-lg transition cursor-pointer"
              aria-label="Menú"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="border-t border-white/[0.06] bg-surface-header/95 backdrop-blur-md">
          <div
            className={`container-custom overflow-hidden md:overflow-visible transition-[max-height,opacity] duration-250 ease-[cubic-bezier(0.23,1,0.32,1)] ${
              menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            } md:max-h-none md:opacity-100`}
          >
            <ul className="flex flex-col md:flex-row md:items-center md:justify-center gap-0 md:gap-0 py-1 md:py-0 -mx-2 md:mx-0">
              <li>
                <Link
                  href="/"
                  className={`block px-4 py-3.5 md:py-2.5 text-[13px] font-semibold uppercase tracking-wider transition relative group cursor-pointer ${
                    isActive("/")
                      ? "text-white md:text-primary"
                      : "text-gray-400 hover:text-white md:hover:text-primary"
                  }`}
                >
                  Inicio
                  <span
                    className={`absolute bottom-0 left-4 right-4 h-[2px] bg-primary transition-transform origin-left hidden md:block ${
                      isActive("/")
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              </li>
              {/* Desktop: only visible categories */}
              {visibleCategories.map((cat) => (
                <li key={cat.id} className="hidden md:block">
                  <Link
                    href={`/${cat.slug}`}
                    className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wider transition relative group cursor-pointer ${
                      isActive(`/${cat.slug}`)
                        ? "text-primary"
                        : "text-gray-400 hover:text-primary"
                    }`}
                  >
                    {cat.name}
                    <span
                      className={`absolute bottom-0 left-4 right-4 h-[2px] bg-primary transition-transform origin-left ${
                        isActive(`/${cat.slug}`)
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              ))}

              {/* Desktop: "Más" dropdown for hidden categories */}
              {hiddenCategories.length > 0 && (
                <li className="hidden md:block relative" data-more-menu>
                  <button
                    onClick={() => setMoreOpen(!moreOpen)}
                    className={`flex items-center gap-1 px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wider transition cursor-pointer ${
                      moreOpen || hiddenCategories.some((c) => isActive(`/${c.slug}`))
                        ? "text-primary"
                        : "text-gray-400 hover:text-primary"
                    }`}
                  >
                    Más
                    <svg
                      className={`w-3.5 h-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {moreOpen && (
                    <div className="absolute top-full left-0 mt-0 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl py-1 min-w-[200px] z-50">
                      {hiddenCategories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/${cat.slug}`}
                          className={`flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wider transition ${
                            isActive(`/${cat.slug}`)
                              ? "text-primary bg-white/5"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              )}

              {/* Mobile: all categories */}
              {categories.map((cat) => (
                <li key={cat.id} className="md:hidden">
                  <Link
                    href={`/${cat.slug}`}
                    className={`flex items-center gap-2 px-4 py-3.5 text-[13px] font-semibold uppercase tracking-wider transition relative group cursor-pointer border-b border-white/[0.04] ${
                      isActive(`/${cat.slug}`)
                        ? "text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/contacto"
                  className={`block px-4 py-3.5 md:py-2.5 text-[13px] font-semibold uppercase tracking-wider transition relative group cursor-pointer ${
                    isActive("/contacto")
                      ? "text-white md:text-primary"
                      : "text-gray-400 hover:text-white md:hover:text-primary"
                  }`}
                >
                  Contacto
                  <span
                    className={`absolute bottom-0 left-4 right-4 h-[2px] bg-primary transition-transform origin-left hidden md:block ${
                      isActive("/contacto")
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              </li>
            </ul>

            {/* Mobile search */}
            <form action="/buscar" className="md:hidden pb-3 px-2">
              <div className="relative flex items-center">
                <input
                  name="q"
                  type="text"
                  placeholder="Buscar noticias..."
                  className="w-full px-4 py-2.5 pr-10 rounded-full bg-white/[0.06] border border-white/[0.08] text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary/50"
                />
                <button
                  type="submit"
                  className="absolute right-2 p-1.5 text-gray-400 active:text-primary cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </nav>
      </div>
    </header>
  );
}
