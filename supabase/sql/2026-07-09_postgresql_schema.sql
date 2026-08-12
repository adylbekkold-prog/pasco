-- Полная PostgreSQL-схема для портала лабораторий
-- Совместимо с Docker Compose и Supabase

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  name_ru text,
  name_ky text,
  icon text,
  color text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  level integer NOT NULL UNIQUE,
  label text NOT NULL,
  label_ru text,
  label_ky text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  name_ru text,
  name_ky text,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS labs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  title_ru text,
  title_ky text,
  topic text,
  topic_ru text,
  topic_ky text,
  content text,
  content_ru text,
  content_ky text,
  goal text,
  goal_ru text,
  goal_ky text,
  expected_results text,
  expected_results_ru text,
  expected_results_ky text,
  teacher_notes text,
  teacher_notes_ru text,
  teacher_notes_ky text,
  thumbnail_url text,
  photo_urls text[],
  is_published boolean NOT NULL DEFAULT false,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  grade_id uuid REFERENCES grades(id) ON DELETE SET NULL,
  equipment_ids uuid[] DEFAULT '{}',
  difficulty text,
  duration_minutes integer,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab_steps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lab_id uuid NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  step_order integer NOT NULL DEFAULT 0,
  block_type text NOT NULL DEFAULT 'text',
  content text,
  content_ru text,
  content_ky text,
  caption text,
  caption_ru text,
  caption_ky text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lab_id uuid NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  resource_type text NOT NULL DEFAULT 'link',
  title text NOT NULL,
  title_ru text,
  title_ky text,
  description text,
  description_ru text,
  description_ky text,
  url text,
  file_size integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab_equipment_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lab_id uuid NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  item_name_ru text,
  item_name_ky text,
  quantity integer NOT NULL DEFAULT 1,
  notes text,
  notes_ru text,
  notes_ky text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);


CREATE INDEX IF NOT EXISTS idx_labs_is_published ON labs(is_published)
  WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_labs_subject_id ON labs(subject_id);
CREATE INDEX IF NOT EXISTS idx_labs_grade_id ON labs(grade_id);
CREATE INDEX IF NOT EXISTS idx_lab_steps_lab_id ON lab_steps(lab_id);
CREATE INDEX IF NOT EXISTS idx_resources_lab_id ON resources(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_equipment_items_lab_id ON lab_equipment_items(lab_id);

INSERT INTO subjects (slug, name, name_ru, name_ky, icon, color, sort_order)
VALUES
  ('physics', 'Физика', 'Физика', 'Физика', 'atom', '#2563eb', 1),
  ('chemistry', 'Химия', 'Химия', 'Химия', 'flask-conical', '#dc2626', 2),
  ('biology', 'Биология', 'Биология', 'Биология', 'leaf', '#16a34a', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO grades (level, label, label_ru, label_ky)
VALUES
  (7, '7 класс', '7 класс', '7-класс'),
  (8, '8 класс', '8 класс', '8-класс'),
  (9, '9 класс', '9 класс', '9-класс'),
  (10, '10 класс', '10 класс', '10-класс'),
  (11, '11 класс', '11 класс', '11-класс'),
  (12, '12 класс', '12 класс', '12-класс')
ON CONFLICT (level) DO NOTHING;

INSERT INTO equipment (slug, name, name_ru, name_ky, subject_id)
VALUES
  ('mechanics-kit', 'Комплект по механике', 'Комплект по механике', 'Механика комплекти', NULL),
  ('em-kit', 'Комплект по электричеству и магнетизму', 'Комплект по электричеству и магнетизму', 'Электр жана магнетизм комплекти', NULL),
  ('optics-kit', 'Комплект по оптике', 'Комплект по оптике', 'Оптика комплекти', NULL),
  ('fluids-kit', 'Комплект по жидкостям', 'Комплект по жидкостям', 'Суюктуктар комплекти', NULL),
  ('waves-kit', 'Комплект по волнам и звуку', 'Комплект по волнам и звуку', 'Толкундар жана үн комплекти', NULL),
  ('chem-starter', 'Стартовый набор по химии', 'Стартовый набор по химии', 'Химия боюнча баштапкы комплект', NULL),
  ('bio-starter', 'Стартовый набор по биологии', 'Стартовый набор по биологии', 'Биология боюнча баштапкы комплект', NULL)
ON CONFLICT (slug) DO NOTHING;
