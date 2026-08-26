import {
  authorSchema,
  dateLikeSchema,
  objectIdSchema,
  offsetPaginationSchema
} from '@/contracts/shared'
import { z } from 'zod'

export const blogStatusSchema = z.enum(['draft', 'published', 'private'])

export const contentBlockSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'code', 'image', 'video']),
  content: z.string(),
  order: z.number(),
  metadata: z
    .object({
      language: z.string().optional(),
      caption: z.string().optional(),
      alt: z.string().optional(),
      url: z.string().optional()
    })
    .optional()
})

export const blogSchema = z.object({
  _id: objectIdSchema,
  userId: z.string(),
  title: z.string(),
  slug: z.string(),
  summary: z.string(),
  content: z.string(),
  contentBlocks: z.array(contentBlockSchema).default([]),
  coverImage: z.string().optional(),
  mediaFiles: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  status: blogStatusSchema,
  featured: z.boolean(),
  author: authorSchema,
  likes: z.number().optional(),
  likedBy: z.array(z.string()).optional(),
  views: z.number().optional(),
  readTime: z.number().optional(),
  commentCount: z.number().optional(),
  publishedAt: dateLikeSchema.optional(),
  createdAt: dateLikeSchema.optional(),
  updatedAt: dateLikeSchema.optional()
})

/** GET /api/blog */
export const blogListResponseSchema = z.object({
  blogs: z.array(blogSchema),
  pagination: offsetPaginationSchema
})

/** GET /api/blog/[id], POST /api/blog, PATCH /api/blog/[id] */
export const blogResponseSchema = blogSchema

/** DELETE /api/blog/[id] */
export const blogDeleteResponseSchema = z.object({
  message: z.string()
})

export const commentSchema = z.object({
  _id: objectIdSchema,
  blogId: z.string(),
  userId: z.string(),
  content: z.string(),
  parentId: z.string().nullable().optional(),
  author: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    avatar: z.string().optional()
  }),
  likes: z.number().optional(),
  likedBy: z.array(z.string()).optional(),
  createdAt: dateLikeSchema.optional(),
  updatedAt: dateLikeSchema.optional()
})

/** GET /api/blog/[id]/comments — top-level comments with one level of replies. */
export const commentListResponseSchema = z.array(
  commentSchema.extend({
    replies: z.array(commentSchema).default([])
  })
)

/** POST /api/blog/[id]/comments */
export const commentResponseSchema = commentSchema

/** POST /api/blog/[id]/comments/[commentId]/like */
export const commentLikeResponseSchema = z.object({
  likes: z.number(),
  liked: z.boolean()
})

export type Blog = z.infer<typeof blogSchema>
export type BlogListResponse = z.infer<typeof blogListResponseSchema>
