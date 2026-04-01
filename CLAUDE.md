# TuPerfil.net — Portal de Noticias

## Descripcion del proyecto
Portal de noticias regional/local con sitio publico y panel de administracion.
Rediseno completo del sitio WordPress actual (https://tuperfil.net/).
El admin debe ser extremadamente simple para un usuario no tecnico.

## Tech Stack
- **Framework**: Next.js 14.2 (App Router) con TypeScript
- **Base de datos / Auth / Storage**: Supabase
- **Estilos**: Tailwind CSS 3.4 con @tailwindcss/typography
- **Deploy**: Vercel
- **Editor de texto**: TipTap (rich text con YouTube, Twitter embeds, tablas, blockquotes)
- **Fechas**: date-fns (en espanol)
- **Emails**: Resend (newsletter + notificaciones contacto)
- **Tipografia**: Playfair Display (display/titulares) + Outfit (body/UI) via next/font/google
- **Config**: next.config.mjs (no .ts — Next.js 14 no soporta .ts)

## Comandos
- `npm run dev` — Servidor de desarrollo
- `npm run build` — Build de produccion
- `npm run lint` — Linter
- `npm run start` — Servidor de produccion

## Estructura de carpetas
```
src/
├── app/
│   ├── (public)/          # Rutas publicas (home, noticias, categorias, contacto, etc.)
│   ├── admin/             # Panel de administracion (protegido por auth)
│   │   ├── login/         # Login page
│   │   └── (dashboard)/   # Panel protegido con sidebar
│   ├── api/               # API routes (views, contact, comments, newsletter, ads, admin)
│   └── layout.tsx         # Layout raiz (fonts, dark mode anti-flash script)
├── components/
│   ├── public/            # Componentes del sitio publico
│   │   ├── ThemeToggle.tsx  # Toggle dark/light con variantes (dark-bg, auto)
│   │   ├── Header.tsx       # Header con logo, fecha, nav, busqueda
│   │   ├── Footer.tsx       # Footer con newsletter, categorias, links
│   │   └── ...
│   ├── admin/             # Componentes del panel admin
│   └── ui/                # Componentes UI reutilizables (blog-section, etc.)
├── lib/
│   ├── supabase/          # Clientes Supabase (client.ts, server.ts, admin.ts, middleware.ts)
│   ├── utils.ts           # Helpers (smartDate, readingTime, BLUR_DATA_URL, generateSlug)
│   ├── rate-limit.ts      # Rate limiter in-memory
│   └── newsletter.ts      # Helpers newsletter (generateUnsubscribeToken)
└── types/
    └── index.ts           # Tipos TypeScript
```

## Base de datos (Supabase)
- **articles**: id, title, slug, content, excerpt, image_url, gallery, category_id, published, published_at, views, author_name, deleted_at, created_at, updated_at, author_id
- **categories**: id, name, slug, color, created_at
- **contacts**: id, name, email, message, read, created_at
- **tags**: id, name, slug — con tabla pivote **article_tags**
- **comments**: id, article_id, name, email, content, approved, created_at
- **subscribers**: id, email, created_at (newsletter)
- **breaking_news**: id, text, active, created_at
- **profiles**: id, user_id, role (admin/editor), created_at
- **ads**: id, title, image_url, link_url, position, active, sort_order
- **ad_events**: tracking clicks/impressions
- **page_views**: id, article_id, referrer, source, created_at
- **Storage bucket**: `article-images` (publico lectura, autenticado escritura)
- **RLS**: lectura publica para articles (published=true, deleted_at IS NULL) y categories; escritura solo autenticados
- **RPCs**: increment_views, popular_articles_this_week, related_articles_by_tags, trending_articles_24h, ad_metrics

## Categorias del sitio
1. Perfil Politico — Politica (#2563EB)
2. Perfil Judicial — Judiciales y legales (#DC2626)
3. Perfil Salud — Salud (#16A34A)
4. Perfil Deportivo — Deportes (#EAB308)
5. Perfil Regional — Noticias locales (#9333EA)
6. Perfil Internacional — Noticias del mundo (#0891B2)

## Paleta de colores y tema
- **Primary**: #E30613 (rojo), hover: #FF1A2A, dark: #B00510
- **Surfaces**: header #1A1A1A, footer #111111, surface #F5F5F5, card #FFFFFF
- **Dark mode**: Implementado via CSS custom properties + clase `.dark` en Tailwind
  - Colores semanticos: `bg-surface`, `bg-surface-card`, `text-heading`, `text-body`, `text-muted`, `border-surface-border`
  - Anti-flash script en `<head>` lee localStorage/prefers-color-scheme antes del paint
  - ThemeToggle con variantes: `dark-bg` (superficies oscuras como header) y `auto` (superficies adaptativas como admin)
  - Header y Footer son siempre oscuros, no necesitan variantes dark:
  - Admin sidebar siempre oscuro, no necesita cambios

## Tipografia
- **Display/Titulares**: Playfair Display — serif editorial de alto contraste, via next/font/google (--font-playfair)
- **Body/UI**: Outfit — sans-serif geometrica moderna, via next/font/google (--font-outfit)
- Clases Tailwind: `font-sans` (Outfit), `font-display` (Playfair Display)
- Tamanos display: `text-display-sm/md/lg/xl` con tracking tight

## Responsive design
- Spacing progresivo: `py-4 sm:py-6 lg:py-8`
- Typography progresiva: `text-display-sm sm:text-display-md md:text-display-lg lg:text-display-xl`
- Header: logo h-10 mobile, h-20 desktop; fecha truncada en mobile
- Hero carousel: alturas adaptativas h-[260px] sm:h-[320px] md:h-[380px] lg:h-[400px]
- Admin: sidebar colapsable mobile, cards en vez de tabla

## Convenciones
- Idioma de la UI: espanol
- URLs amigables con slugs en espanol (ej: /noticia/titulo-de-la-noticia)
- Rutas admin en espanol (/admin/noticias, /admin/categorias)
- Componentes en PascalCase, archivos en kebab-case o PascalCase segun Next.js conventions
- Server Components por defecto, "use client" solo cuando sea necesario
- Validar inputs en boundaries del sistema (formularios, API)
- No over-engineer: mantener todo simple y directo
- Supabase joins con `.returns<T[]>()` para tipado correcto
- Route groups: (public) para sitio, (dashboard) para admin autenticado

## Variables de entorno requeridas
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
ADMIN_EMAIL=
RESEND_FROM_EMAIL=          # opcional
NEWSLETTER_SECRET=          # opcional, fallback a SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_GA_MEASUREMENT_ID=  # opcional, Google Analytics 4
```
