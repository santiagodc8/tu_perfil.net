-- Galería de imágenes para artículos (array de URLs en JSON)
ALTER TABLE articles ADD COLUMN gallery JSONB NOT NULL DEFAULT '[]';
