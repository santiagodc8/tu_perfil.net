-- ============================================
-- TuPerfil.net — Sistema de comentarios moderados
-- ============================================

-- Tabla: comments
CREATE TABLE comments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id   UUID        NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  author_name  TEXT        NOT NULL,
  author_email TEXT        NOT NULL,
  content      TEXT        NOT NULL,
  approved     BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para consultas por artículo
CREATE INDEX idx_comments_article_id ON comments(article_id);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Público: puede enviar comentarios (INSERT)
CREATE POLICY "comments_public_insert"
  ON comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Público: puede leer solo comentarios aprobados
CREATE POLICY "comments_public_read"
  ON comments FOR SELECT
  TO anon
  USING (approved = true);

-- Autenticados: pueden leer todos los comentarios (para moderar)
CREATE POLICY "comments_auth_read"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

-- Autenticados: pueden actualizar (aprobar/rechazar)
CREATE POLICY "comments_auth_update"
  ON comments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Autenticados: pueden eliminar
CREATE POLICY "comments_auth_delete"
  ON comments FOR DELETE
  TO authenticated
  USING (true);
