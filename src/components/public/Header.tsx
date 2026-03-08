"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";

export default function Header({ categories }: { categories: Category[] }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-surface-header text-white sticky top-0 z-40">
      {/* Top bar - hidden on mobile */}
      <div className="container-custom py-1.5 text-xs text-gray-400 hidden sm:block border-b border-white/10">
        <span className="capitalize">{today}</span>
      </div>

      {/* Main header */}
      <div className="container-custom py-3 sm:py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex-shrink-0">
          {/* Mobile logo */}
          <Image
            src="/logo-header-mobile@2x.png"
            alt="TuPerfil.net"
            width={320}
            height={100}
            className="h-9 w-auto sm:hidden"
            priority
          />
          {/* Desktop logo */}
          <Image
            src="/logo-header@2x.png"
            alt="TuPerfil.net"
            width={500}
            height={150}
            className="hidden sm:block h-11 w-auto"
            priority
          />
        </Link>

        {/* Desktop search */}
        <form action="/buscar" className="hidden md:flex items-center">
          <input
            name="q"
            type="text"
            placeholder="Buscar noticias..."
            className="px-4 py-2 rounded-l-lg bg-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:bg-white/20 w-56 transition"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary hover:bg-primary-hover rounded-r-lg text-sm font-medium transition"
          >
            Buscar
          </button>
        </form>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 -mr-2 text-gray-300 hover:text-white active:bg-white/10 rounded-lg"
          aria-label="Menú"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="border-t border-white/10">
        <div className={`container-custom ${menuOpen ? "block" : "hidden"} md:block`}>
          <ul className="flex flex-col md:flex-row md:items-center gap-0 md:gap-0.5 py-1 md:py-0 -mx-2 md:mx-0">
            <li>
              <Link
                href="/"
                className="block px-4 py-3 md:py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 md:rounded-lg transition active:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                Inicio
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/${cat.slug}`}
                  className="block px-4 py-3 md:py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 md:rounded-lg transition active:bg-white/10"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/contacto"
                className="block px-4 py-3 md:py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 md:rounded-lg transition active:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                Contacto
              </Link>
            </li>
          </ul>

          {/* Mobile search */}
          <form action="/buscar" className="md:hidden pb-3 px-2">
            <div className="flex">
              <input
                name="q"
                type="text"
                placeholder="Buscar noticias..."
                className="flex-1 px-4 py-2.5 rounded-l-lg bg-white/10 text-white placeholder-gray-400 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary rounded-r-lg text-sm font-medium active:bg-primary-dark"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      </nav>
    </header>
  );
}
