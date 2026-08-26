import { dateLikeSchema, objectIdSchema } from '@/contracts/shared'
import { z } from 'zod'

export const contactMessageSchema = z.object({
  _id: objectIdSchema,
  fullName: z.string(),
  avatarColor: z.string().optional(),
  email: z.string(),
  subject: z.string(),
  message: z.string(),
  read: z.boolean(),
  date: dateLikeSchema.optional(),
  createdAt: dateLikeSchema.optional(),
  updatedAt: dateLikeSchema.optional()
})

/** POST /api/contact — always the `{ msg, success }` envelope. */
export const contactSubmitResponseSchema = z.object({
  msg: z.array(z.string()),
  success: z.boolean(),
  emailSent: z.boolean().optional()
})

/** GET /api/contact — admin inbox, a bare array. */
export const contactListResponseSchema = z.array(contactMessageSchema)

/** PATCH and DELETE /api/contact/[id] return the affected document. */
export const contactMutationResponseSchema = contactMessageSchema

export type ContactMessage = z.infer<typeof contactMessageSchema>
