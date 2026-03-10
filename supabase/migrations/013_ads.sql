-- Tabla de publicidad/anuncios
CREATE TABLE ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,                          -- nombre interno para referencia del admin
  image_url TEXT NOT NULL,                      -- imagen del anuncio
  link_url TEXT DEFAULT '',                     -- URL destino al hacer click (opcional)
  position TEXT NOT NULL DEFAULT 'sidebar',     -- sidebar | header | between_articles
  active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,                     -- orden de aparición
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Lectura pública (solo activos)
CREATE POLICY "Ads are publicly readable" ON ads
  FOR SELECT USING (active = true);

-- Escritura solo para autenticados
CREATE POLICY "Authenticated users can manage ads" ON ads
  FOR ALL USING (auth.role() = 'authenticated');
