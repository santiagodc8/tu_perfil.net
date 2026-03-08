-- Agregar campo published_at para publicación programada
-- NULL = publicar inmediatamente, fecha futura = programada
ALTER TABLE articles ADD COLUMN published_at TIMESTAMPTZ;

-- Actualizar política de lectura pública:
-- Solo mostrar artículos publicados cuya fecha ya pasó (o no tienen fecha)
DROP POLICY "articles_public_read" ON articles;

CREATE POLICY "articles_public_read"
  ON articles FOR SELECT
  TO anon, authenticated
  USING (
    (
      published = true
      AND (published_at IS NULL OR published_at <= now())
    )
    OR auth.role() = 'authenticated'
  );
