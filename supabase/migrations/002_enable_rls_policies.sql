-- Enable Row Level Security (RLS) для всех таблиц
-- Эта миграция обеспечивает базовую защиту данных

-- ==============================================
-- 1. SUBJECTS TABLE RLS
-- ==============================================

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Публичное чтение для всех (subjects = справочник)
CREATE POLICY "subjects_select_public" ON subjects
  FOR SELECT
  USING (true);

-- Только администраторы могут создавать/обновлять/удалять
CREATE POLICY "subjects_insert_admin" ON subjects
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "subjects_update_admin" ON subjects
  FOR UPDATE
  USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "subjects_delete_admin" ON subjects
  FOR DELETE
  USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- ==============================================
-- 2. GRADES TABLE RLS
-- ==============================================

ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Публичное чтение
CREATE POLICY "grades_select_public" ON grades
  FOR SELECT
  USING (true);

-- Только админ может модифицировать
CREATE POLICY "grades_insert_admin" ON grades
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "grades_update_admin" ON grades
  FOR UPDATE
  USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- ==============================================
-- 3. EQUIPMENT TABLE RLS
-- ==============================================

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- Публичное чтение
CREATE POLICY "equipment_select_public" ON equipment
  FOR SELECT
  USING (true);

-- Только админ может модифицировать
CREATE POLICY "equipment_insert_admin" ON equipment
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "equipment_update_admin" ON equipment
  FOR UPDATE
  USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- ==============================================
-- 4. LABS TABLE RLS (КРИТИЧНО!)
-- ==============================================

ALTER TABLE labs ENABLE ROW LEVEL SECURITY;

-- Все могут видеть опубликованные лаборатории
CREATE POLICY "labs_select_published" ON labs
  FOR SELECT
  USING (is_published = true);

-- Автор и админ могут видеть свои неопубликованные лаборатории
CREATE POLICY "labs_select_owner" ON labs
  FOR SELECT
  USING (
    auth.uid() = created_by OR
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- Только аутентифицированные пользователи могут создавать
CREATE POLICY "labs_insert_authenticated" ON labs
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() = created_by
  );

-- Только автор или админ могут обновлять
CREATE POLICY "labs_update_owner" ON labs
  FOR UPDATE
  USING (
    auth.uid() = created_by OR
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    auth.uid() = created_by OR
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- Только автор или админ могут удалять
CREATE POLICY "labs_delete_owner" ON labs
  FOR DELETE
  USING (
    auth.uid() = created_by OR
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- ==============================================
-- 5. LAB_STEPS TABLE RLS
-- ==============================================

ALTER TABLE lab_steps ENABLE ROW LEVEL SECURITY;

-- Видеть шаги если лаборатория опубликована или это владелец
CREATE POLICY "lab_steps_select" ON lab_steps
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM labs
      WHERE labs.id = lab_steps.lab_id
      AND (
        labs.is_published = true OR
        labs.created_by = auth.uid() OR
        (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
      )
    )
  );

-- Создавать шаги только если ты владелец лаборатории
CREATE POLICY "lab_steps_insert" ON lab_steps
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM labs
      WHERE labs.id = lab_steps.lab_id
      AND (
        labs.created_by = auth.uid() OR
        (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
      )
    )
  );

-- Обновлять только если владелец
CREATE POLICY "lab_steps_update" ON lab_steps
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM labs
      WHERE labs.id = lab_steps.lab_id
      AND (
        labs.created_by = auth.uid() OR
        (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
      )
    )
  );

-- ==============================================
-- 6. RESOURCES TABLE RLS
-- ==============================================

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Видеть ресурсы если лаборатория опубликована или это владелец
CREATE POLICY "resources_select" ON resources
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM labs
      WHERE labs.id = resources.lab_id
      AND (
        labs.is_published = true OR
        labs.created_by = auth.uid() OR
        (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
      )
    )
  );

-- Создавать ресурсы только если владелец лаборатории
CREATE POLICY "resources_insert" ON resources
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM labs
      WHERE labs.id = resources.lab_id
      AND (
        labs.created_by = auth.uid() OR
        (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
      )
    )
  );

-- Обновлять только если владелец
CREATE POLICY "resources_update" ON resources
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM labs
      WHERE labs.id = resources.lab_id
      AND (
        labs.created_by = auth.uid() OR
        (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
      )
    )
  );

-- ==============================================
-- 7. LAB_EQUIPMENT_ITEMS TABLE RLS
-- ==============================================

ALTER TABLE lab_equipment_items ENABLE ROW LEVEL SECURITY;

-- Видеть если лаборатория видима
CREATE POLICY "lab_equipment_items_select" ON lab_equipment_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM labs
      WHERE labs.id = lab_equipment_items.lab_id
      AND (
        labs.is_published = true OR
        labs.created_by = auth.uid() OR
        (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
      )
    )
  );

-- Модифицировать только если владелец
CREATE POLICY "lab_equipment_items_insert" ON lab_equipment_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM labs
      WHERE labs.id = lab_equipment_items.lab_id
      AND (
        labs.created_by = auth.uid() OR
        (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
      )
    )
  );

CREATE POLICY "lab_equipment_items_update" ON lab_equipment_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM labs
      WHERE labs.id = lab_equipment_items.lab_id
      AND (
        labs.created_by = auth.uid() OR
        (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
      )
    )
  );

-- ==============================================
-- 8. ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- ==============================================

-- Индекс для быстрого поиска опубликованных лабораторий
CREATE INDEX IF NOT EXISTS idx_labs_is_published ON labs(is_published)
  WHERE is_published = true;

-- Индекс для поиска лабораторий по автору
CREATE INDEX IF NOT EXISTS idx_labs_created_by ON labs(created_by);

-- Индекс для поиска шагов по лаборатории
CREATE INDEX IF NOT EXISTS idx_lab_steps_lab_id ON lab_steps(lab_id);

-- Индекс для поиска ресурсов по лаборатории
CREATE INDEX IF NOT EXISTS idx_resources_lab_id ON resources(lab_id);

-- Индекс для поиска оборудования по лаборатории
CREATE INDEX IF NOT EXISTS idx_lab_equipment_items_lab_id ON lab_equipment_items(lab_id);

-- ==============================================
-- 9. LOG RLS ENABLED STATUS
-- ==============================================

-- Отключить временно для проверки (только для дебага)
-- WARNING: Удалить перед production!
-- ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;

-- Статус RLS можно проверить с помощью:
-- SELECT tablename FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND rowsecurity = true;
