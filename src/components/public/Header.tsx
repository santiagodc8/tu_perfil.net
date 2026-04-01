"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";
import ThemeToggle from "./ThemeToggle";

export default function Header({ categories }: { categories: Category[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
            className={`container-custom overflow-hidden transition-[max-height,opacity] duration-250 ease-[cubic-bezier(0.23,1,0.32,1)] ${
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
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/${cat.slug}`}
                    className={`flex items-center gap-2 px-4 py-3.5 md:py-2.5 text-[13px] font-semibold uppercase tracking-wider transition relative group cursor-pointer border-b border-white/[0.04] md:border-b-0 ${
                      isActive(`/${cat.slug}`)
                        ? "text-white md:text-primary"
                        : "text-gray-400 hover:text-white md:hover:text-primary"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full md:hidden flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                    <span
                      className={`absolute bottom-0 left-4 right-4 h-[2px] bg-primary transition-transform origin-left hidden md:block ${
                        isActive(`/${cat.slug}`)
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/muy-personal"
                  className={`block px-4 py-3.5 md:py-2.5 text-[13px] font-semibold uppercase tracking-wider transition relative group cursor-pointer ${
                    isActive("/muy-personal")
                      ? "text-white md:text-primary"
                      : "text-gray-400 hover:text-white md:hover:text-primary"
                  }`}
                >
                  Muy Personal
                  <span
                    className={`absolute bottom-0 left-4 right-4 h-[2px] bg-primary transition-transform origin-left hidden md:block ${
                      isActive("/muy-personal")
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              </li>
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
