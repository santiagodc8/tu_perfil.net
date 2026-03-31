import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";
import NewsletterForm from "@/components/public/NewsletterForm";

export default function Footer({ categories }: { categories: Category[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-footer text-gray-400 relative noise-overlay">
      {/* Top decorative line */}
      <div className="h-[3px] bg-gradient-to-r from-primary via-primary-hover to-primary" />

      <div className="container-custom py-10 sm:py-16 relative z-10">
        {/* Newsletter */}
        <div className="mb-12 sm:mb-16 pb-10 sm:pb-12 border-b border-white/[0.06]">
          <NewsletterForm />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* About */}
          <div className="lg:col-span-1">
            <Image
              src="/logo-footer.png"
              alt="TuPerfil.net"
              width={200}
              height={60}
              className="h-8 w-auto mb-5"
            />
            <p className="text-sm leading-relaxed text-gray-500">
              Portal de noticias regional. Información veraz y oportuna sobre
              política, judicial, salud, deportes y más.
            </p>
            {/* Social icons */}
            <div className="flex gap-3 mt-5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-gray-500 hover:bg-primary hover:text-white hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-gray-500 hover:bg-primary hover:text-white hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display text-white text-lg mb-1.5">Categorías</h4>
            <div className="w-8 h-0.5 bg-primary rounded-full mb-4" />
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/${cat.slug}`}
                    className="text-sm hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group py-0.5 cursor-pointer"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full opacity-60 group-hover:opacity-100 transition"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-white text-lg mb-1.5">Enlaces</h4>
            <div className="w-8 h-0.5 bg-primary rounded-full mb-4" />
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/contacto" className="hover:text-white hover:translate-x-1 transition-all inline-block py-0.5 cursor-pointer">
                  Formulario de contacto
                </Link>
              </li>
              <li>
                <Link href="/acerca-de" className="hover:text-white hover:translate-x-1 transition-all inline-block py-0.5 cursor-pointer">
                  Acerca de nosotros
                </Link>
              </li>
              <li>
                <Link href="/politica-de-privacidad" className="hover:text-white hover:translate-x-1 transition-all inline-block py-0.5 cursor-pointer">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="hover:text-white hover:translate-x-1 transition-all inline-block py-0.5 cursor-pointer">
                  Términos y condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="font-display text-white text-lg mb-1.5">Contacto</h4>
            <div className="w-8 h-0.5 bg-primary rounded-full mb-4" />
            <p className="text-sm leading-relaxed text-gray-500">
              ¿Tenés una noticia o querés comunicarte con nosotros?
            </p>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-primary hover:bg-primary-hover active:bg-primary-dark text-white text-sm font-semibold rounded-lg transition-colors hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Escribinos
            </Link>
          </div>
        </div>

        <div className="border-t border-white/[0.06] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>&copy; {year} TuPerfil.net — Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <Link href="/politica-de-privacidad" className="hover:text-gray-300 transition cursor-pointer">Privacidad</Link>
            <Link href="/terminos" className="hover:text-gray-300 transition cursor-pointer">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
