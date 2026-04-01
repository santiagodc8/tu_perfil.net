-- Agregar campo video_url a articles
ALTER TABLE articles ADD COLUMN video_url TEXT;

-- Agregar categoría "Muy Personal"
INSERT INTO categories (name, slug, color)
VALUES ('Muy Personal', 'muy-personal', '#F97316')
ON CONFLICT DO NOTHING;
