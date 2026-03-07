-- ============================================
-- TuPerfil.net — Esquema inicial
-- ============================================

-- Tabla: categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#1a1a2e',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla: articles
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  published BOOLEAN NOT NULL DEFAULT false,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabla: contacts
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_published ON articles(published);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Trigger: actualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Categories: lectura publica, escritura solo autenticados
CREATE POLICY "categories_public_read"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "categories_auth_insert"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "categories_auth_update"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "categories_auth_delete"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Articles: lectura publica solo publicados, escritura solo autenticados
CREATE POLICY "articles_public_read"
  ON articles FOR SELECT
  TO anon, authenticated
  USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "articles_auth_insert"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "articles_auth_update"
  ON articles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "articles_auth_delete"
  ON articles FOR DELETE
  TO authenticated
  USING (true);

-- Contacts: escritura publica, lectura solo autenticados
CREATE POLICY "contacts_public_insert"
  ON contacts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "contacts_auth_read"
  ON contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "contacts_auth_update"
  ON contacts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "contacts_auth_delete"
  ON contacts FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- Storage: bucket para imagenes de articulos
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true);

-- Lectura publica
CREATE POLICY "article_images_public_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'article-images');

-- Escritura solo autenticados
CREATE POLICY "article_images_auth_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-images');

CREATE POLICY "article_images_auth_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'article-images');

CREATE POLICY "article_images_auth_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'article-images');

-- ============================================
-- Seed: categorias iniciales
-- ============================================

INSERT INTO categories (name, slug, color) VALUES
  ('Perfil Político',       'perfil-politico',       '#1a1a2e'),
  ('Perfil Judicial',       'perfil-judicial',       '#6c3483'),
  ('Perfil Salud',          'perfil-salud',          '#27ae60'),
  ('Perfil Deportivo',      'perfil-deportivo',      '#e94560'),
  ('Perfil Regional',       'perfil-regional',       '#2980b9'),
  ('Perfil Internacional',  'perfil-internacional',  '#e67e22');
