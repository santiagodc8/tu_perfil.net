-- Función RPC para obtener artículos relacionados por tags en común
CREATE OR REPLACE FUNCTION related_articles_by_tags(
  p_article_id UUID,
  p_category_id UUID,
  lim INT DEFAULT 4
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ,
  category_name TEXT,
  category_color TEXT,
  shared_tags BIGINT
) AS $$
BEGIN
  RETURN QUERY
  -- Artículos que comparten tags, ordenados por cantidad de tags en común
  SELECT
    a.id,
    a.title,
    a.slug,
    a.excerpt,
    a.image_url,
    a.created_at,
    c.name AS category_name,
    c.color AS category_color,
    COUNT(at2.tag_id) AS shared_tags
  FROM article_tags at1
  INNER JOIN article_tags at2 ON at1.tag_id = at2.tag_id AND at2.article_id != p_article_id
  INNER JOIN articles a ON a.id = at2.article_id
  LEFT JOIN categories c ON c.id = a.category_id
  WHERE at1.article_id = p_article_id
    AND a.published = true
    AND a.deleted_at IS NULL
  GROUP BY a.id, a.title, a.slug, a.excerpt, a.image_url, a.created_at, c.name, c.color
  ORDER BY shared_tags DESC, a.created_at DESC
  LIMIT lim;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
