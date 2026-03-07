# TuPerfil.net — Portal de Noticias

## Descripcion del proyecto
Portal de noticias regional/local con sitio publico y panel de administracion.
Rediseno completo del sitio WordPress actual (https://tuperfil.net/).
El admin debe ser extremadamente simple para un usuario no tecnico.

## Tech Stack
- **Framework**: Next.js 14+ (App Router) con TypeScript
- **Base de datos / Auth / Storage**: Supabase
- **Estilos**: Tailwind CSS
- **Deploy**: Vercel
- **Editor de texto**: TipTap (rich text simplificado)
- **Fechas**: date-fns (en espanol)

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
│   └── layout.tsx         # Layout raiz
├── components/
│   ├── public/            # Componentes del sitio publico
│   └── admin/             # Componentes del panel admin
├── lib/
│   ├── supabase/          # Clientes Supabase (client.ts, server.ts, admin.ts)
│   └── utils.ts           # Helpers (slug, fechas, etc.)
└── types/
    └── index.ts           # Tipos TypeScript (Article, Category, Contact)
```

## Base de datos (Supabase)
- **articles**: id, title, slug, content, excerpt, image_url, category_id, published, views, created_at, updated_at, author_id
- **categories**: id, name, slug, color, created_at
- **contacts**: id, name, email, message, read, created_at
- **Storage bucket**: `article-images` (publico lectura, autenticado escritura)
- **RLS**: lectura publica para articles (published=true) y categories; escritura solo autenticados

## Categorias del sitio
1. Perfil Politico — Politica
2. Perfil Judicial — Judiciales y legales
3. Perfil Salud — Salud
4. Perfil Deportivo — Deportes
5. Perfil Regional — Noticias locales
6. Perfil Internacional — Noticias del mundo

## Paleta de colores
- Primario: #1a1a2e (azul oscuro)
- Acento: #e94560 (rojo)
- Fondos: blancos y grises
- Sin dark mode

## Convenciones
- Idioma de la UI: espanol
- URLs amigables con slugs en espanol (ej: /noticia/titulo-de-la-noticia)
- Rutas admin en espanol (/admin/noticias, /admin/categorias)
- Componentes en PascalCase, archivos en kebab-case o PascalCase segun Next.js conventions
- Server Components por defecto, "use client" solo cuando sea necesario
- Validar inputs en boundaries del sistema (formularios, API)
- No over-engineer: mantener todo simple y directo

## Variables de entorno requeridas
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
