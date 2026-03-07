-- Actualizar colores de categorias para la nueva paleta
UPDATE categories SET color = '#2563EB' WHERE slug = 'perfil-politico';
UPDATE categories SET color = '#DC2626' WHERE slug = 'perfil-judicial';
UPDATE categories SET color = '#16A34A' WHERE slug = 'perfil-salud';
UPDATE categories SET color = '#EAB308' WHERE slug = 'perfil-deportivo';
UPDATE categories SET color = '#9333EA' WHERE slug = 'perfil-regional';
UPDATE categories SET color = '#0891B2' WHERE slug = 'perfil-internacional';
