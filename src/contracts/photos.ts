import { dateLikeSchema, objectIdSchema } from '@/contracts/shared'
import { z } from 'zod'

export const photoSchema = z.object({
  _id: objectIdSchema,
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string(),
  imageKey: z.string(),
  uploadedBy: z.string(),
  isPublic: z.boolean(),
  capturedAt: dateLikeSchema.optional(),
  createdAt: dateLikeSchema.optional(),
  updatedAt: dateLikeSchema.optional()
})

/** GET /api/photos — a bare array, newest capture first. */
export const photoListResponseSchema = z.array(photoSchema)

/** POST /api/photos and PUT /api/photos/[id] */
export const photoResponseSchema = photoSchema

/** DELETE /api/photos/[id] */
export const photoDeleteResponseSchema = z.object({
  message: z.string()
})

export type Photo = z.infer<typeof photoSchema>
