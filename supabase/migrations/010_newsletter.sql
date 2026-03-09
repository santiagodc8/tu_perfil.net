-- 010_newsletter.sql
-- Tabla de suscriptores al newsletter

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- Índice para búsquedas por email
create index if not exists subscribers_email_idx on subscribers (email);
-- Índice para filtrar activos
create index if not exists subscribers_active_idx on subscribers (active);

-- RLS
alter table subscribers enable row level security;

-- Solo usuarios autenticados pueden leer y gestionar suscriptores
create policy "Authenticated users can read subscribers"
  on subscribers for select
  to authenticated
  using (true);

create policy "Authenticated users can update subscribers"
  on subscribers for update
  to authenticated
  using (true);

create policy "Authenticated users can delete subscribers"
  on subscribers for delete
  to authenticated
  using (true);

-- El público puede insertar (suscribirse) — la API valida antes de insertar
create policy "Anyone can subscribe"
  on subscribers for insert
  to anon, authenticated
  with check (true);
