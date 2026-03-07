-- ============================================
-- Seed de desarrollo
-- Ejecutar DESPUES de 001_initial_schema.sql
-- y DESPUES de crear un usuario en Supabase Auth
-- ============================================

-- Reemplazar 'TU_USER_ID' con el UUID real del usuario admin
-- Lo puedes encontrar en Supabase Dashboard > Authentication > Users

DO $$
DECLARE
  v_author_id UUID;
  v_cat_politico UUID;
  v_cat_judicial UUID;
  v_cat_salud UUID;
  v_cat_deportivo UUID;
  v_cat_regional UUID;
  v_cat_internacional UUID;
BEGIN
  -- Obtener el primer usuario existente
  SELECT id INTO v_author_id FROM auth.users LIMIT 1;

  IF v_author_id IS NULL THEN
    RAISE EXCEPTION 'No hay usuarios en auth.users. Crea uno primero desde el dashboard de Supabase.';
  END IF;

  -- Obtener IDs de categorias
  SELECT id INTO v_cat_politico FROM categories WHERE slug = 'perfil-politico';
  SELECT id INTO v_cat_judicial FROM categories WHERE slug = 'perfil-judicial';
  SELECT id INTO v_cat_salud FROM categories WHERE slug = 'perfil-salud';
  SELECT id INTO v_cat_deportivo FROM categories WHERE slug = 'perfil-deportivo';
  SELECT id INTO v_cat_regional FROM categories WHERE slug = 'perfil-regional';
  SELECT id INTO v_cat_internacional FROM categories WHERE slug = 'perfil-internacional';

  -- Articulos de ejemplo
  INSERT INTO articles (title, slug, content, excerpt, category_id, published, views, author_id) VALUES
  (
    'Gobierno anuncia nuevas medidas económicas para el próximo trimestre',
    'gobierno-anuncia-nuevas-medidas-economicas',
    '<p>El gobierno presentó hoy un paquete de medidas económicas que buscan estabilizar la situación fiscal del país.</p><h2>Principales puntos</h2><ul><li>Reducción de impuestos para pequeñas empresas</li><li>Nuevo plan de inversión en infraestructura</li><li>Programa de empleo juvenil</li></ul><p>Los analistas consideran que estas medidas podrían tener un impacto positivo en la economía durante los próximos meses.</p>',
    'El gobierno presentó hoy un paquete de medidas económicas que buscan estabilizar la situación fiscal del país.',
    v_cat_politico, true, 150, v_author_id
  ),
  (
    'Tribunal emite fallo histórico sobre caso de corrupción',
    'tribunal-emite-fallo-historico-corrupcion',
    '<p>En una decisión sin precedentes, el tribunal de primera instancia emitió un fallo condenatorio en el caso de corrupción que ha mantenido en vilo a la opinión pública.</p><p>La sentencia establece penas de hasta 15 años de prisión para los principales implicados.</p>',
    'En una decisión sin precedentes, el tribunal emitió un fallo condenatorio en el caso de corrupción que ha mantenido en vilo a la opinión pública.',
    v_cat_judicial, true, 230, v_author_id
  ),
  (
    'Campaña de vacunación alcanza cifra récord en la región',
    'campana-vacunacion-cifra-record',
    '<p>La campaña de vacunación regional alcanzó una cifra récord con más de 50,000 personas vacunadas en una sola semana.</p><p>Las autoridades sanitarias celebraron el logro y anunciaron la extensión del programa por dos semanas más.</p>',
    'La campaña de vacunación regional alcanzó una cifra récord con más de 50,000 personas vacunadas en una sola semana.',
    v_cat_salud, true, 95, v_author_id
  ),
  (
    'Equipo local clasifica a la final del torneo nacional',
    'equipo-local-clasifica-final-torneo',
    '<p>Con una victoria contundente de 3-1, el equipo local se clasificó a la gran final del torneo nacional que se disputará el próximo fin de semana.</p><p>Los goles fueron obra de los delanteros estrella del equipo, quienes han tenido una temporada excepcional.</p>',
    'Con una victoria contundente de 3-1, el equipo local se clasificó a la gran final del torneo nacional.',
    v_cat_deportivo, true, 320, v_author_id
  ),
  (
    'Inauguran nueva planta de tratamiento de agua en el municipio',
    'inauguran-planta-tratamiento-agua',
    '<p>Las autoridades municipales inauguraron hoy la nueva planta de tratamiento de agua que beneficiará a más de 20,000 familias de la zona.</p><p>La obra, que tuvo una inversión de varios millones, permitirá mejorar la calidad del agua potable en toda la región.</p>',
    'Las autoridades municipales inauguraron la nueva planta de tratamiento de agua que beneficiará a más de 20,000 familias.',
    v_cat_regional, true, 78, v_author_id
  ),
  (
    'Cumbre mundial sobre cambio climático llega a acuerdos históricos',
    'cumbre-cambio-climatico-acuerdos-historicos',
    '<p>Los líderes mundiales reunidos en la cumbre sobre cambio climático llegaron a acuerdos históricos para reducir las emisiones de carbono en un 40% para 2035.</p><p>El acuerdo incluye compromisos financieros de los países desarrollados para apoyar la transición energética en naciones en desarrollo.</p>',
    'Los líderes mundiales llegaron a acuerdos históricos para reducir las emisiones de carbono en un 40% para 2035.',
    v_cat_internacional, true, 112, v_author_id
  );

  RAISE NOTICE 'Seed completado: 6 articulos de ejemplo creados para el usuario %', v_author_id;
END $$;
