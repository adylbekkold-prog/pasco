export type Locale = 'ru' | 'ky'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'professional'

export type StepBlockType = 'text' | 'image' | 'video' | 'link' | 'diagram'

export type ResourceType = 'pdf' | 'image' | 'video' | 'worksheet' | 'link'

export interface Subject {
  id: string
  name: string
  name_ru?: string | null
  name_ky?: string | null
  slug: string
  icon: string | null
  color: string | null
  sort_order: number
}

export interface Grade {
  id: string
  level: number
  label: string
  label_ru?: string | null
  label_ky?: string | null
}

export interface Equipment {
  id: string
  name: string
  name_ru?: string | null
  name_ky?: string | null
  slug: string
  subject_id: string | null
}

export interface LabStep {
  id: string
  lab_id: string
  step_order: number
  block_type: StepBlockType
  content: string | null
  content_ru?: string | null
  content_ky?: string | null
  caption: string | null
  caption_ru?: string | null
  caption_ky?: string | null
}

export interface LabStepDraft {
  id: string
  block_type: StepBlockType
  content: string
  caption: string
}

export interface Resource {
  id: string
  lab_id: string
  resource_type: ResourceType
  title: string
  title_ru?: string | null
  title_ky?: string | null
  url: string
  file_size: number | null
  sort_order: number
}

export interface EquipmentItem {
  id: string
  lab_id: string
  item_name: string
  item_name_ru?: string | null
  item_name_ky?: string | null
  quantity: number
  notes: string | null
  notes_ru?: string | null
  notes_ky?: string | null
  sort_order: number
}

export interface EquipmentItemDraft {
  name: string
  quantity: number
  notes: string
}

export interface Lab {
  id: string
  title: string
  title_ru?: string | null
  title_ky?: string | null
  slug: string
  content: string | null
  content_ru?: string | null
  content_ky?: string | null
  thumbnail_url: string | null
  is_published: boolean
  subject_id: string | null
  grade_id: string | null
  equipment_ids: string[] | null
  difficulty?: Difficulty
  created_at: string
  updated_at: string
  subjects?: Subject | null
  grades?: Grade | null
  equipment?: Equipment[]
  resources?: Resource[]
  equipment_items?: EquipmentItem[]
  lab_steps?: LabStep[]
  // Fields for lab content
  topic?: string | null
  topic_ru?: string | null
  topic_ky?: string | null
  goal?: string | null
  goal_ru?: string | null
  goal_ky?: string | null
  expected_results?: string | null
  expected_results_ru?: string | null
  expected_results_ky?: string | null
  teacher_notes?: string | null
  teacher_notes_ru?: string | null
  teacher_notes_ky?: string | null
  duration_minutes?: number | null
}

export interface PascoKit {
  id: string
  name: string
  name_ru?: string | null
  name_ky?: string | null
  slug: string
  description: string | null
  description_ru?: string | null
  description_ky?: string | null
  thumbnail_url: string | null
  subject_id: string
  sort_order: number
  created_at: string
  updated_at: string
  subject?: Subject | null
  components?: PascoKitComponent[]
}

export interface PascoKitComponent {
  id: string
  kit_id: string
  name: string
  name_ru?: string | null
  name_ky?: string | null
  quantity: number
  photo_url: string | null
  description: string | null
  description_ru?: string | null
  description_ky?: string | null
  storage_location: string | null
  storage_location_ru?: string | null
  storage_location_ky?: string | null
  notes: string | null
  notes_ru?: string | null
  notes_ky?: string | null
  sort_order: number
  created_at?: string
  updated_at?: string
}

export interface PascoKitComponentDraft {
  name: string
  quantity: number
  description: string
  storage_location: string
  notes: string
}
