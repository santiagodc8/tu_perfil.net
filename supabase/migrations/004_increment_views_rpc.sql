-- Función RPC para incrementar vistas de forma atómica
CREATE OR REPLACE FUNCTION increment_views(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE articles SET views = views + 1 WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
