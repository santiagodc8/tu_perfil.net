-- Tabla de vistas detalladas para métricas avanzadas
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer TEXT,
  referrer_source TEXT -- 'direct', 'google', 'facebook', 'twitter', 'whatsapp', 'other'
);

-- Índices para queries de métricas
CREATE INDEX idx_page_views_article_id ON page_views(article_id);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at);
CREATE INDEX idx_page_views_source ON page_views(referrer_source);

-- RLS: inserción pública (anon), lectura solo autenticados
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read page views"
  ON page_views FOR SELECT
  TO authenticated
  USING (true);

-- Actualizar la función increment_views para también insertar en page_views
CREATE OR REPLACE FUNCTION increment_views(article_id UUID, p_referrer TEXT DEFAULT NULL, p_referrer_source TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
  UPDATE articles SET views = views + 1 WHERE id = article_id;
  INSERT INTO page_views (article_id, referrer, referrer_source)
  VALUES (article_id, p_referrer, p_referrer_source);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
