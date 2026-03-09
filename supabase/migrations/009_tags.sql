-- ============================================
-- TuPerfil.net — Etiquetas (tags) many-to-many
-- ============================================

-- Tabla: tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla: article_tags (junction)
CREATE TABLE article_tags (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Indices
CREATE INDEX idx_article_tags_article ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag     ON article_tags(tag_id);
CREATE INDEX idx_tags_slug            ON tags(slug);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE tags         ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;

-- Tags: lectura pública, escritura solo autenticados
CREATE POLICY "tags_public_read"
  ON tags FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "tags_auth_insert"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "tags_auth_update"
  ON tags FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "tags_auth_delete"
  ON tags FOR DELETE
  TO authenticated
  USING (true);

-- Article_tags: lectura pública, escritura solo autenticados
CREATE POLICY "article_tags_public_read"
  ON article_tags FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "article_tags_auth_insert"
  ON article_tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "article_tags_auth_delete"
  ON article_tags FOR DELETE
  TO authenticated
  USING (true);
