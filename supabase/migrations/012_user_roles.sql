-- ============================================
-- TuPerfil.net — Sistema de roles de usuario
-- ============================================

-- Tabla: profiles
-- Se crea automáticamente para cada usuario de auth.users
CREATE TABLE profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  full_name   TEXT        NOT NULL DEFAULT '',
  role        TEXT        NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Función helper: is_admin()
-- Verifica si el usuario actual tiene rol 'admin'
-- (debe crearse ANTES de las políticas RLS que la usan)
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden leer perfiles
CREATE POLICY "profiles_auth_read"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Solo admins pueden actualizar perfiles (via helper function)
CREATE POLICY "profiles_admin_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Solo admins pueden eliminar perfiles
CREATE POLICY "profiles_admin_delete"
  ON profiles FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- Trigger: auto-crear perfil al registrar usuario
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    -- El primer usuario registrado es admin; el resto son editores
    CASE
      WHEN (SELECT COUNT(*) FROM profiles) = 0 THEN 'admin'
      ELSE 'editor'
    END
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Insertar perfil para usuarios existentes
-- (asigna 'admin' al primero, 'editor' al resto)
-- ============================================

INSERT INTO profiles (id, email, full_name, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  CASE
    WHEN ROW_NUMBER() OVER (ORDER BY u.created_at ASC) = 1 THEN 'admin'
    ELSE 'editor'
  END
FROM auth.users u
ON CONFLICT (id) DO NOTHING;
