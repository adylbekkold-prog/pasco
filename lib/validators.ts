import { z } from 'zod'

// Schemas для валидации
export const CreateLabSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must be less than 255 characters'),
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  topic: z.string().nullable().optional(),
  goal: z.string().nullable().optional(),
  expected_results: z.string().nullable().optional(),
  teacher_notes: z.string().nullable().optional(),
  subject_id: z.string().nullable().optional(),
  grade_id: z.string().nullable().optional(),
  equipment_id: z.string().nullable().optional(),
  duration_minutes: z.number().int().min(5).max(480).nullable().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'professional']).nullable().optional(),
  is_published: z.boolean().default(false),
})

export const UpdateLabSchema = CreateLabSchema.partial()

export const FiltersSchema = z.object({
  subject: z.string().optional(),
  grade: z.string().optional(),
  difficulty: z.string().optional(),
  search: z.string().optional(),
})

export type CreateLabInput = z.infer<typeof CreateLabSchema>
export type UpdateLabInput = z.infer<typeof UpdateLabSchema>
export type FiltersInput = z.infer<typeof FiltersSchema>
