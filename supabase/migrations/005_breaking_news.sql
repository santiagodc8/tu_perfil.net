-- Tabla para noticias de última hora (banner urgente)
-- Diseñada para una sola fila activa a la vez
CREATE TABLE breaking_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL DEFAULT '',
  link TEXT,
  active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para updated_at
CREATE TRIGGER breaking_news_updated_at
  BEFORE UPDATE ON breaking_news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS: lectura pública, escritura solo autenticados
ALTER TABLE breaking_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "breaking_news_public_read"
  ON breaking_news FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "breaking_news_auth_insert"
  ON breaking_news FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "breaking_news_auth_update"
  ON breaking_news FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insertar fila inicial (inactiva)
INSERT INTO breaking_news (text, active) VALUES ('', false);
