-- Soft delete para artículos (papelera de reciclaje)

-- 1. Agregar campo deleted_at
ALTER TABLE articles ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Índice para filtrar rápido
CREATE INDEX idx_articles_deleted_at ON articles(deleted_at);

-- 3. Actualizar RLS de lectura pública: excluir borrados
DROP POLICY IF EXISTS "Public can read published articles" ON articles;
CREATE POLICY "Public can read published articles"
  ON articles FOR SELECT
  TO anon, authenticated
  USING (published = true AND deleted_at IS NULL);

-- 4. Actualizar función increment_views para ignorar artículos borrados
CREATE OR REPLACE FUNCTION increment_views(article_id UUID, p_referrer TEXT DEFAULT NULL, p_referrer_source TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
  UPDATE articles SET views = views + 1
  WHERE id = article_id AND deleted_at IS NULL;
  INSERT INTO page_views (article_id, referrer, referrer_source)
  VALUES (article_id, p_referrer, p_referrer_source);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
