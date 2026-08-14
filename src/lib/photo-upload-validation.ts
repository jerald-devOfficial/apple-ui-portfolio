import { z } from 'zod'

export const photoUploadFieldsSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).optional().default(''),
  isPublic: z.boolean(),
  capturedAt: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || !Number.isNaN(Date.parse(value)),
      'Invalid capture date'
    )
})
