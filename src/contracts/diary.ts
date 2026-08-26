import {
  dateLikeSchema,
  objectIdSchema,
  pagePaginationSchema
} from '@/contracts/shared'
import { z } from 'zod'

export const codeSnippetSchema = z.object({
  language: z.string(),
  code: z.string(),
  description: z.string().optional()
})

export const resourceSchema = z.object({
  url: z.string(),
  title: z.string(),
  type: z.enum(['article', 'video', 'documentation', 'github', 'other'])
})

export const diarySchema = z.object({
  _id: objectIdSchema,
  userId: z.string(),
  title: z.string(),
  content: z.string(),
  publicity: z.boolean(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  codeSnippets: z.array(codeSnippetSchema).optional(),
  resources: z.array(resourceSchema).optional(),
  status: z.enum(['draft', 'published']),
  isFavorite: z.boolean(),
  lastEditedSection: z.string().optional(),
  createdAt: dateLikeSchema.optional(),
  updatedAt: dateLikeSchema.optional(),
  wordCount: z.number().optional(),
  liked: z.boolean().optional()
})

/** GET /api/diary */
export const diaryListResponseSchema = z.object({
  diaries: z.array(diarySchema),
  pagination: pagePaginationSchema
})

/** POST /api/diary/[id]/like */
export const diaryLikeResponseSchema = z.object({
  liked: z.boolean()
})

const namedCountSchema = z.object({
  name: z.string().nullable(),
  count: z.number()
})

/** GET /api/diary/stats */
export const diaryStatsResponseSchema = z.object({
  totalEntries: z.number(),
  categories: z.array(namedCountSchema),
  topTags: z.array(namedCountSchema),
  entriesByMonth: z.array(
    z.object({ year: z.number(), month: z.number(), count: z.number() })
  ),
  languages: z.array(namedCountSchema),
  wordCountStats: z
    .object({
      avgWordCount: z.number().nullable(),
      minWordCount: z.number().nullable(),
      maxWordCount: z.number().nullable(),
      totalWords: z.number().nullable()
    })
    .nullable(),
  recentActivity: z.array(
    z.object({
      _id: objectIdSchema,
      title: z.string().optional(),
      updatedAt: dateLikeSchema.optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional()
    })
  )
})

/** GET /api/diary/snippets */
export const diarySnippetsResponseSchema = z.object({
  snippets: z.array(
    z.object({
      diaryId: objectIdSchema,
      diaryTitle: z.string(),
      snippetId: z.string().optional(),
      language: z.string(),
      code: z.string(),
      description: z.string().optional(),
      createdAt: dateLikeSchema.optional(),
      category: z.string().optional()
    })
  ),
  languages: z.array(z.string()),
  pagination: pagePaginationSchema
})

/** GET /api/diary/resources */
export const diaryResourcesResponseSchema = z.object({
  resources: z.array(
    z.object({
      diaryId: objectIdSchema,
      diaryTitle: z.string(),
      url: z.string(),
      title: z.string(),
      type: z.string(),
      createdAt: dateLikeSchema.optional()
    })
  ),
  types: z.array(z.string()),
  pagination: pagePaginationSchema
})

export type Diary = z.infer<typeof diarySchema>
export type DiaryListResponse = z.infer<typeof diaryListResponseSchema>
