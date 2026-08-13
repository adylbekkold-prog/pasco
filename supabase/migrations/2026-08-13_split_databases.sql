-- ==============================================
-- SPLIT DATABASES SCHEMA
-- Применяется к ОБЕИМ базам: pasco_lab_ru и pasco_lab_ky
-- Каждая база содержит данные только своего языка.
-- ==============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- ==============================================
-- 1. SUBJECTS
-- ==============================================
CREATE TABLE IF NOT EXISTS public.subjects (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    name_ru text,
    name_ky text,
    icon text,
    color text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.subjects OWNER TO pasco_user;

-- ==============================================
-- 2. GRADES
-- ==============================================
CREATE TABLE IF NOT EXISTS public.grades (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    level integer NOT NULL,
    label text NOT NULL,
    label_ru text,
    label_ky text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.grades OWNER TO pasco_user;

-- ==============================================
-- 3. EQUIPMENT
-- ==============================================
CREATE TABLE IF NOT EXISTS public.equipment (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    name_ru text,
    name_ky text,
    subject_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.equipment OWNER TO pasco_user;

-- ==============================================
-- 4. LABS
-- ==============================================
CREATE TABLE IF NOT EXISTS public.labs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    slug text NOT NULL,
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
    is_published boolean DEFAULT false NOT NULL,
    subject_id uuid,
    grade_id uuid,
    equipment_ids uuid[] DEFAULT '{}'::uuid[],
    difficulty text,
    duration_minutes integer,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT labs_duration_minutes_check CHECK (((duration_minutes IS NULL) OR ((duration_minutes >= 5) AND (duration_minutes <= 480))))
);

ALTER TABLE public.labs OWNER TO pasco_user;

-- ==============================================
-- 5. LAB_STEPS
-- ==============================================
CREATE TABLE IF NOT EXISTS public.lab_steps (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    lab_id uuid NOT NULL,
    step_order integer DEFAULT 0 NOT NULL,
    block_type text DEFAULT 'text'::text NOT NULL,
    content text,
    content_ru text,
    content_ky text,
    caption text,
    caption_ru text,
    caption_ky text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.lab_steps OWNER TO pasco_user;

-- ==============================================
-- 6. RESOURCES
-- ==============================================
CREATE TABLE IF NOT EXISTS public.resources (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    lab_id uuid NOT NULL,
    resource_type text DEFAULT 'link'::text NOT NULL,
    title text NOT NULL,
    title_ru text,
    title_ky text,
    description text,
    description_ru text,
    description_ky text,
    url text,
    file_size integer,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.resources OWNER TO pasco_user;

-- ==============================================
-- 7. LAB_EQUIPMENT_ITEMS
-- ==============================================
CREATE TABLE IF NOT EXISTS public.lab_equipment_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    lab_id uuid NOT NULL,
    item_name text NOT NULL,
    item_name_ru text,
    item_name_ky text,
    quantity integer DEFAULT 1 NOT NULL,
    notes text,
    notes_ru text,
    notes_ky text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.lab_equipment_items OWNER TO pasco_user;

-- ==============================================
-- 8. PASCO KITS
-- ==============================================
CREATE TABLE IF NOT EXISTS public.pasco_kits (
    id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    name_ru text,
    name_ky text,
    description text,
    description_ru text,
    description_ky text,
    thumbnail_url text,
    subject_id text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.pasco_kits OWNER TO pasco_user;

-- ==============================================
-- 9. PASCO KIT COMPONENTS
-- ==============================================
CREATE TABLE IF NOT EXISTS public.pasco_kit_components (
    id text NOT NULL,
    kit_id text NOT NULL,
    name text NOT NULL,
    name_ru text,
    name_ky text,
    quantity integer DEFAULT 1 NOT NULL,
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
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.pasco_kit_components OWNER TO pasco_user;

-- ==============================================
-- 10. PRIMARY KEYS
-- ==============================================
ALTER TABLE ONLY public.subjects ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.subjects ADD CONSTRAINT subjects_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.grades ADD CONSTRAINT grades_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.grades ADD CONSTRAINT grades_level_key UNIQUE (level);
ALTER TABLE ONLY public.equipment ADD CONSTRAINT equipment_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.labs ADD CONSTRAINT labs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.labs ADD CONSTRAINT labs_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.lab_steps ADD CONSTRAINT lab_steps_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.resources ADD CONSTRAINT resources_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.lab_equipment_items ADD CONSTRAINT lab_equipment_items_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.pasco_kits ADD CONSTRAINT pasco_kits_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.pasco_kits ADD CONSTRAINT pasco_kits_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.pasco_kit_components ADD CONSTRAINT pasco_kit_components_pkey PRIMARY KEY (id);

-- ==============================================
-- 11. FOREIGN KEYS
-- ==============================================
ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.lab_equipment_items
    ADD CONSTRAINT lab_equipment_items_lab_id_fkey FOREIGN KEY (lab_id) REFERENCES public.labs(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.lab_steps
    ADD CONSTRAINT lab_steps_lab_id_fkey FOREIGN KEY (lab_id) REFERENCES public.labs(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.labs
    ADD CONSTRAINT labs_grade_id_fkey FOREIGN KEY (grade_id) REFERENCES public.grades(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.labs
    ADD CONSTRAINT labs_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.pasco_kit_components
    ADD CONSTRAINT pasco_kit_components_kit_id_fkey FOREIGN KEY (kit_id) REFERENCES public.pasco_kits(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_lab_id_fkey FOREIGN KEY (lab_id) REFERENCES public.labs(id) ON DELETE CASCADE;

-- ==============================================
-- 12. INDEXES
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_lab_equipment_items_lab_id ON public.lab_equipment_items USING btree (lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_steps_lab_id ON public.lab_steps USING btree (lab_id);
CREATE INDEX IF NOT EXISTS idx_labs_grade_id ON public.labs USING btree (grade_id);
CREATE INDEX IF NOT EXISTS idx_labs_is_published ON public.labs USING btree (is_published) WHERE (is_published = true);
CREATE INDEX IF NOT EXISTS idx_labs_subject_id ON public.labs USING btree (subject_id);
CREATE INDEX IF NOT EXISTS idx_pasco_kit_components_kit_id ON public.pasco_kit_components USING btree (kit_id);
CREATE INDEX IF NOT EXISTS idx_pasco_kits_sort_order ON public.pasco_kits USING btree (sort_order);
CREATE INDEX IF NOT EXISTS idx_pasco_kits_subject_id ON public.pasco_kits USING btree (subject_id);
CREATE INDEX IF NOT EXISTS idx_resources_lab_id ON public.resources USING btree (lab_id);

-- ==============================================
-- 13. ROW LEVEL SECURITY (публичное чтение)
-- ==============================================
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY subjects_select_public ON public.subjects FOR SELECT USING (true);
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY grades_select_public ON public.grades FOR SELECT USING (true);
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY equipment_select_public ON public.equipment FOR SELECT USING (true);
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;
CREATE POLICY labs_select_published ON public.labs FOR SELECT USING (is_published = true);
ALTER TABLE public.lab_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY lab_steps_select ON public.lab_steps FOR SELECT USING (true);
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY resources_select ON public.resources FOR SELECT USING (true);
ALTER TABLE public.lab_equipment_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY lab_equipment_items_select ON public.lab_equipment_items FOR SELECT USING (true);
ALTER TABLE public.pasco_kits ENABLE ROW LEVEL SECURITY;
CREATE POLICY pasco_kits_select_public ON public.pasco_kits FOR SELECT USING (true);
ALTER TABLE public.pasco_kit_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY pasco_kit_components_select_public ON public.pasco_kit_components FOR SELECT USING (true);
