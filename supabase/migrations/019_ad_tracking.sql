-- Tabla para tracking de impresiones y clicks de publicidad
CREATE TABLE ad_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para consultas de métricas
CREATE INDEX idx_ad_events_ad_id ON ad_events(ad_id);
CREATE INDEX idx_ad_events_created_at ON ad_events(created_at);
CREATE INDEX idx_ad_events_type ON ad_events(event_type);

-- RLS: inserción pública (anon puede trackear), lectura solo autenticados
ALTER TABLE ad_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert ad events"
  ON ad_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can read ad events"
  ON ad_events FOR SELECT
  TO authenticated
  USING (true);

-- Función RPC para obtener métricas de ads
CREATE OR REPLACE FUNCTION ad_metrics(days INT DEFAULT 30)
RETURNS TABLE (
  ad_id UUID,
  impressions BIGINT,
  clicks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.ad_id,
    COUNT(*) FILTER (WHERE e.event_type = 'impression') AS impressions,
    COUNT(*) FILTER (WHERE e.event_type = 'click') AS clicks
  FROM ad_events e
  WHERE e.created_at >= now() - (days || ' days')::interval
  GROUP BY e.ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
