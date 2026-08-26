import { z } from 'zod'

/** Dates cross the wire as ISO strings, but handler tests may pass `Date`. */
export const dateLikeSchema = z.union([z.string(), z.date()])

export const objectIdSchema = z.string().min(1)

/** `/api/blog` — offset pagination. */
export const offsetPaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  pages: z.number()
})

/** `/api/diary`, `/api/diary/snippets`, `/api/diary/resources`. */
export const pagePaginationSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  totalItems: z.number(),
  itemsPerPage: z.number()
})

/** `{ msg, success }` envelope used by contact and require-admin. */
export const messageEnvelopeSchema = z.object({
  msg: z.array(z.string()),
  success: z.boolean(),
  emailSent: z.boolean().optional()
})

/** `{ error }` envelope used by blog, diary like, photos and comments. */
export const errorResponseSchema = z.object({
  error: z.string()
})

/** `{ msg }` envelope used by diary, chess and the diary meta routes. */
export const msgResponseSchema = z.object({
  msg: z.string()
})

export const authorSchema = z.union([
  z.string(),
  z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    image: z.string().optional(),
    email: z.string().optional()
  })
])

export type OffsetPagination = z.infer<typeof offsetPaginationSchema>
export type PagePagination = z.infer<typeof pagePaginationSchema>
export type MessageEnvelope = z.infer<typeof messageEnvelopeSchema>
