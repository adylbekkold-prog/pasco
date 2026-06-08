-- Обновление существующей Supabase-схемы под RU/KY локализацию.
-- Этот файл нужно запускать поверх уже созданных таблиц subjects/grades/equipment/labs/...
-- Безопасно для повторного запуска: используются IF NOT EXISTS и idempotent UPDATE/UPSERT.

-- 1. Локализованные колонки для справочников
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS name_ru text;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS name_ky text;

ALTER TABLE grades ADD COLUMN IF NOT EXISTS label_ru text;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS label_ky text;

ALTER TABLE equipment ADD COLUMN IF NOT EXISTS name_ru text;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS name_ky text;

-- 2. Локализованные колонки для лабораторий и связанных сущностей
ALTER TABLE labs ADD COLUMN IF NOT EXISTS title_ru text;
ALTER TABLE labs ADD COLUMN IF NOT EXISTS title_ky text;
ALTER TABLE labs ADD COLUMN IF NOT EXISTS topic_ru text;
ALTER TABLE labs ADD COLUMN IF NOT EXISTS topic_ky text;
ALTER TABLE labs ADD COLUMN IF NOT EXISTS goal_ru text;
ALTER TABLE labs ADD COLUMN IF NOT EXISTS goal_ky text;
ALTER TABLE labs ADD COLUMN IF NOT EXISTS expected_results_ru text;
ALTER TABLE labs ADD COLUMN IF NOT EXISTS expected_results_ky text;
ALTER TABLE labs ADD COLUMN IF NOT EXISTS teacher_notes_ru text;
ALTER TABLE labs ADD COLUMN IF NOT EXISTS teacher_notes_ky text;

ALTER TABLE lab_steps ADD COLUMN IF NOT EXISTS content_ru text;
ALTER TABLE lab_steps ADD COLUMN IF NOT EXISTS content_ky text;
ALTER TABLE lab_steps ADD COLUMN IF NOT EXISTS caption_ru text;
ALTER TABLE lab_steps ADD COLUMN IF NOT EXISTS caption_ky text;

ALTER TABLE resources ADD COLUMN IF NOT EXISTS title_ru text;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS title_ky text;

ALTER TABLE lab_equipment_items ADD COLUMN IF NOT EXISTS item_name_ru text;
ALTER TABLE lab_equipment_items ADD COLUMN IF NOT EXISTS item_name_ky text;
ALTER TABLE lab_equipment_items ADD COLUMN IF NOT EXISTS notes_ru text;
ALTER TABLE lab_equipment_items ADD COLUMN IF NOT EXISTS notes_ky text;

-- 3. Предметы: делаем базовое поле русским, отдельно храним RU/KY переводы
UPDATE subjects
SET
  name = CASE slug
    WHEN 'physics' THEN 'Физика'
    WHEN 'chemistry' THEN 'Химия'
    WHEN 'biology' THEN 'Биология'
    ELSE name
  END,
  name_ru = COALESCE(
    name_ru,
    CASE slug
      WHEN 'physics' THEN 'Физика'
      WHEN 'chemistry' THEN 'Химия'
      WHEN 'biology' THEN 'Биология'
      ELSE name
    END
  ),
  name_ky = COALESCE(
    name_ky,
    CASE slug
      WHEN 'physics' THEN 'Физика'
      WHEN 'chemistry' THEN 'Химия'
      WHEN 'biology' THEN 'Биология'
      ELSE name
    END
  )
WHERE slug IN ('physics', 'chemistry', 'biology');

-- 4. Классы: приводим к текущей структуре проекта, включая 12 класс
INSERT INTO grades (level, label, label_ru, label_ky)
VALUES
  (7, '7 класс', '7 класс', '7-класс'),
  (8, '8 класс', '8 класс', '8-класс'),
  (9, '9 класс', '9 класс', '9-класс'),
  (10, '10 класс', '10 класс', '10-класс'),
  (11, '11 класс', '11 класс', '11-класс'),
  (12, '12 класс', '12 класс', '12-класс')
ON CONFLICT (level) DO UPDATE
SET
  label = EXCLUDED.label,
  label_ru = COALESCE(grades.label_ru, EXCLUDED.label_ru),
  label_ky = COALESCE(grades.label_ky, EXCLUDED.label_ky);

-- 5. Оборудование: русская база + явный кыргызский перевод
UPDATE equipment
SET
  name = CASE slug
    WHEN 'mechanics-kit' THEN 'Комплект по механике'
    WHEN 'em-kit' THEN 'Комплект по электричеству и магнетизму'
    WHEN 'optics-kit' THEN 'Комплект по оптике'
    WHEN 'fluids-kit' THEN 'Комплект по жидкостям'
    WHEN 'waves-kit' THEN 'Комплект по волнам и звуку'
    WHEN 'chem-starter' THEN 'Стартовый набор по химии'
    WHEN 'bio-starter' THEN 'Стартовый набор по биологии'
    ELSE name
  END,
  name_ru = COALESCE(
    name_ru,
    CASE slug
      WHEN 'mechanics-kit' THEN 'Комплект по механике'
      WHEN 'em-kit' THEN 'Комплект по электричеству и магнетизму'
      WHEN 'optics-kit' THEN 'Комплект по оптике'
      WHEN 'fluids-kit' THEN 'Комплект по жидкостям'
      WHEN 'waves-kit' THEN 'Комплект по волнам и звуку'
      WHEN 'chem-starter' THEN 'Стартовый набор по химии'
      WHEN 'bio-starter' THEN 'Стартовый набор по биологии'
      ELSE name
    END
  ),
  name_ky = COALESCE(
    name_ky,
    CASE slug
      WHEN 'mechanics-kit' THEN 'Механика комплекти'
      WHEN 'em-kit' THEN 'Электр жана магнетизм комплекти'
      WHEN 'optics-kit' THEN 'Оптика комплекти'
      WHEN 'fluids-kit' THEN 'Суюктуктар комплекти'
      WHEN 'waves-kit' THEN 'Толкундар жана үн комплекти'
      WHEN 'chem-starter' THEN 'Химия боюнча баштапкы комплект'
      WHEN 'bio-starter' THEN 'Биология боюнча баштапкы комплект'
      ELSE name
    END
  )
WHERE slug IN (
  'mechanics-kit',
  'em-kit',
  'optics-kit',
  'fluids-kit',
  'waves-kit',
  'chem-starter',
  'bio-starter'
);

-- 6. Фиксируем текущие тексты как RU-слой, чтобы уже существующие лаборатории
-- продолжали отображаться после миграции даже без ручного перевода.
UPDATE labs
SET
  title_ru = COALESCE(title_ru, title),
  topic_ru = COALESCE(topic_ru, topic),
  goal_ru = COALESCE(goal_ru, goal),
  expected_results_ru = COALESCE(expected_results_ru, expected_results),
  teacher_notes_ru = COALESCE(teacher_notes_ru, teacher_notes);

UPDATE lab_steps
SET
  content_ru = COALESCE(content_ru, content),
  caption_ru = COALESCE(caption_ru, caption);

UPDATE resources
SET
  title_ru = COALESCE(title_ru, title);

UPDATE lab_equipment_items
SET
  item_name_ru = COALESCE(item_name_ru, item_name),
  notes_ru = COALESCE(notes_ru, notes);

-- 7. Подсказка для ручного этапа:
-- После выполнения этого SQL желательно отдельно заполнить *_ky поля
-- для уже существующих лабораторий, шагов, ресурсов и списков оборудования.
