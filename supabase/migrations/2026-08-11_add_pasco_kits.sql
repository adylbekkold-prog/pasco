-- ==============================================
-- PASCO KITS TABLES
-- Добавляет таблицы pasco_kits и pasco_kit_components
-- для хранения данных PASCO-комплектов в PostgreSQL.
-- ==============================================

-- ==============================================
-- 1. PASCO KITS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS pasco_kits (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  name_ru text,
  name_ky text,
  description text,
  description_ru text,
  description_ky text,
  thumbnail_url text,
  subject_id text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ==============================================
-- 2. PASCO KIT COMPONENTS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS pasco_kit_components (
  id text PRIMARY KEY,
  kit_id text NOT NULL REFERENCES pasco_kits(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_ru text,
  name_ky text,
  quantity integer NOT NULL DEFAULT 1,
  photo_url text,
  description text,
  description_ru text,
  description_ky text,
  storage_location text,
  storage_location_ru text,
  storage_location_ky text,
  notes text,
  notes_ru text,
  notes_ky text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ==============================================
-- 3. INDEXES
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_pasco_kit_components_kit_id
  ON pasco_kit_components(kit_id);

CREATE INDEX IF NOT EXISTS idx_pasco_kits_subject_id
  ON pasco_kits(subject_id);

CREATE INDEX IF NOT EXISTS idx_pasco_kits_sort_order
  ON pasco_kits(sort_order);

-- ==============================================
-- 4. ROW LEVEL SECURITY
-- ==============================================
ALTER TABLE pasco_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pasco_kit_components ENABLE ROW LEVEL SECURITY;

-- Публичное чтение для всех
CREATE POLICY "pasco_kits_select_public" ON pasco_kits
  FOR SELECT
  USING (true);

CREATE POLICY "pasco_kit_components_select_public" ON pasco_kit_components
  FOR SELECT
  USING (true);

-- Только администраторы могут модифицировать
CREATE POLICY "pasco_kits_insert_admin" ON pasco_kits
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "pasco_kits_update_admin" ON pasco_kits
  FOR UPDATE
  USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "pasco_kits_delete_admin" ON pasco_kits
  FOR DELETE
  USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "pasco_kit_components_insert_admin" ON pasco_kit_components
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "pasco_kit_components_update_admin" ON pasco_kit_components
  FOR UPDATE
  USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "pasco_kit_components_delete_admin" ON pasco_kit_components
  FOR DELETE
  USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );
