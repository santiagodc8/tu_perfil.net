-- Agregar nombre del autor directamente en articles
-- Más simple que un JOIN a auth.users (que no tiene nombre público)
ALTER TABLE articles ADD COLUMN author_name TEXT NOT NULL DEFAULT 'Redacción TuPerfil.net';
