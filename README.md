# TuPerfil.net — Portal de Noticias

Portal de noticias regional construido con Next.js, Supabase y Tailwind CSS.

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Supabase** (PostgreSQL, Auth, Storage)
- **Tailwind CSS** + Typography plugin
- **TipTap** (editor de texto enriquecido)
- **date-fns** (fechas en español)

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** y ejecutar `supabase/migrations/001_initial_schema.sql`
3. (Opcional) Ejecutar `supabase/seed.sql` para datos de ejemplo
4. Ir a **Authentication > Users > Add user** para crear el usuario admin

### 3. Variables de entorno

Copiar `.env.example` a `.env.local` y completar:

```bash
cp .env.example .env.local
```

Las keys se encuentran en **Supabase Dashboard > Settings > API**.

### 4. Ejecutar

```bash
npm run dev
```

- Sitio público: http://localhost:3000
- Panel admin: http://localhost:3000/admin

## Estructura

```
src/
├── app/
│   ├── (public)/          # Sitio público
│   │   ├── page.tsx       # Home
│   │   ├── [category]/    # Listado por categoría
│   │   ├── noticia/[slug] # Noticia individual
│   │   ├── buscar/        # Búsqueda
│   │   ├── contacto/      # Formulario de contacto
│   │   └── acerca-de/     # Página estática
│   ├── admin/
│   │   ├── login/         # Login
│   │   └── (dashboard)/   # Panel (protegido)
│   │       ├── page.tsx   # Dashboard
│   │       ├── noticias/  # CRUD noticias
│   │       ├── categorias/# CRUD categorías
│   │       └── mensajes/  # Mensajes de contacto
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── public/            # Header, Footer, ArticleCard, etc.
│   └── admin/             # Sidebar, ArticleForm, Editor, etc.
├── lib/supabase/          # Clientes Supabase
└── types/                 # Tipos TypeScript
```

## Deploy en Vercel

1. Conectar el repositorio en [vercel.com](https://vercel.com)
2. Agregar las variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
3. Deploy automático en cada push a `main`
