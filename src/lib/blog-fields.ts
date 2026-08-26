import { z } from 'zod'

export const blogContentBlockSchema = z.object({
  id: z.string().min(1),
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

export const blogWriteSchema = z.object({
  title: z.string().trim().min(1).max(300),
  summary: z.string().trim().min(1).max(2000),
  content: z.string().optional().default(''),
  contentBlocks: z.array(blogContentBlockSchema).default([]),
  coverImage: z.string().trim().max(2000).optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(30).default([]),
  category: z.string().trim().min(1).max(80).optional(),
  status: z.enum(['draft', 'published', 'private']).default('draft')
})

export const blogUpdateSchema = blogWriteSchema
  .partial()
  .strict()
  .extend({
    slug: z.string().trim().min(1).max(300).optional(),
    mediaFiles: z.array(z.string()).max(50).optional(),
    featured: z.boolean().optional()
  })

export const slugFromTitle = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const parseBlogFormData = (formData: FormData) => {
  const rawBlocks = String(formData.get('contentBlocks') ?? '[]')
  let contentBlocks: unknown = []

  try {
    contentBlocks = JSON.parse(rawBlocks)
  } catch {
    contentBlocks = []
  }

  const coverImage = String(formData.get('coverImage') ?? '').trim()

  return blogWriteSchema.safeParse({
    title: formData.get('title'),
    summary: formData.get('summary'),
    content: formData.get('content') || '',
    contentBlocks,
    coverImage: coverImage || undefined,
    tags: String(formData.get('tags') ?? '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    category: formData.get('category') || 'technology',
    status: formData.get('status') || 'draft'
  })
}
