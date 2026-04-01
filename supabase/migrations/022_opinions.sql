-- Tabla de opiniones de usuarios (moderadas)
create table if not exists opinions (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_email text not null,
  content text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- Índice para filtrar por aprobación
create index idx_opinions_approved on opinions (approved, created_at desc);

-- RLS
alter table opinions enable row level security;

-- Lectura pública solo de opiniones aprobadas
create policy "opinions_public_read" on opinions
  for select using (approved = true);

-- Cualquiera puede enviar una opinión
create policy "opinions_public_insert" on opinions
  for insert with check (true);

-- Autenticados pueden ver todas, actualizar y eliminar
create policy "opinions_auth_select" on opinions
  for select to authenticated using (true);

create policy "opinions_auth_update" on opinions
  for update to authenticated using (true);

create policy "opinions_auth_delete" on opinions
  for delete to authenticated using (true);
