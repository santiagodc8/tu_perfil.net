-- Agregar campo featured a articles
ALTER TABLE articles ADD COLUMN featured BOOLEAN NOT NULL DEFAULT false;

-- Indice para buscar rapidamente la noticia destacada
CREATE INDEX idx_articles_featured ON articles(featured) WHERE featured = true;
