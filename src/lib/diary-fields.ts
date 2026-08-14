import { z } from 'zod'

export const diaryWriteSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(300),
  content: z.string().min(1, 'Content is required'),
  publicity: z.boolean(),
  tags: z.array(z.string().trim().min(1).max(50)).max(30)
})

export const diaryUpdateSchema = diaryWriteSchema.partial().strict()

export const parseTagsInput = (value: FormDataEntryValue | null) =>
  String(value ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

export const parseDiaryFormData = (formData: FormData) =>
  diaryWriteSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    publicity: formData.get('publicity') === 'public',
    tags: parseTagsInput(formData.get('tags'))
  })
