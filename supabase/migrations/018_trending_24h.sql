-- Función RPC para obtener artículos trending (últimas 24 horas)
CREATE OR REPLACE FUNCTION trending_articles_24h(lim INT DEFAULT 5)
RETURNS TABLE (
  article_id UUID,
  view_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT pv.article_id, COUNT(*) AS view_count
  FROM page_views pv
  INNER JOIN articles a ON a.id = pv.article_id
  WHERE pv.viewed_at >= now() - interval '24 hours'
    AND a.published = true
    AND a.deleted_at IS NULL
  GROUP BY pv.article_id
  ORDER BY view_count DESC
  LIMIT lim;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
