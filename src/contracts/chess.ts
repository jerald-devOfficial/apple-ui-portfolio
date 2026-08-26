import { dateLikeSchema, objectIdSchema } from '@/contracts/shared'
import { z } from 'zod'

export type MoveNodeContract = {
  _id?: string
  san: string
  fen: string
  comment?: string
  nags?: number[]
  mainLine?: MoveNodeContract | null
  variations?: MoveNodeContract[]
}

export const moveNodeSchema: z.ZodType<MoveNodeContract> = z.lazy(() =>
  z.object({
    _id: z.string().optional(),
    san: z.string(),
    fen: z.string(),
    comment: z.string().optional(),
    nags: z.array(z.number()).optional(),
    mainLine: moveNodeSchema.nullable().optional(),
    variations: z.array(moveNodeSchema).optional()
  })
)

export const repertoireLineSchema = z.object({
  _id: objectIdSchema,
  title: z.string(),
  eco: z.string().optional(),
  rootFen: z.string().optional(),
  tree: moveNodeSchema,
  pgn: z.string().optional(),
  order: z.number()
})

export const repertoireSectionSchema = z.object({
  _id: objectIdSchema,
  title: z.string(),
  color: z.enum(['white', 'black']),
  parentMove: z.string().optional(),
  lines: z.array(repertoireLineSchema),
  order: z.number()
})

export const repertoireSchema = z.object({
  _id: objectIdSchema,
  userId: z.string(),
  sections: z.array(repertoireSectionSchema),
  createdAt: dateLikeSchema.optional(),
  updatedAt: dateLikeSchema.optional()
})

/** GET, POST and PATCH /api/chess/repertoire, plus POST .../import */
export const repertoireResponseSchema = z.object({
  repertoire: repertoireSchema,
  message: z.string().optional(),
  success: z.literal(true)
})

/**
 * GET /api/chess/repertoire/export/[lineId] returns
 * `application/x-chess-pgn` text rather than JSON.
 */
export const repertoireExportContentType = 'application/x-chess-pgn'

export type Repertoire = z.infer<typeof repertoireSchema>
export type RepertoireResponse = z.infer<typeof repertoireResponseSchema>
