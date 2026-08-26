import {
  diaryUpdateSchema,
  diaryWriteSchema,
  parseDiaryFormData,
  parseTagsInput
} from '@/lib/diary-fields'
import { describe, expect, it } from 'vitest'

describe('parseTagsInput', () => {
  it('splits, trims and drops blanks', () => {
    expect(parseTagsInput(' learning , , bug-fix ')).toEqual([
      'learning',
      'bug-fix'
    ])
  })

  it('returns an empty list for null', () => {
    expect(parseTagsInput(null)).toEqual([])
  })
})

describe('diaryWriteSchema', () => {
  it('accepts a complete entry', () => {
    const result = diaryWriteSchema.safeParse({
      title: 'Today I learned',
      content: '<p>Something useful</p>',
      publicity: true,
      tags: ['learning']
    })

    expect(result.success).toBe(true)
  })

  it('requires a title and content', () => {
    const result = diaryWriteSchema.safeParse({
      title: '   ',
      content: '',
      publicity: false,
      tags: []
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining(['Title is required', 'Content is required'])
    )
  })

  it('rejects more than 30 tags', () => {
    const result = diaryWriteSchema.safeParse({
      title: 'Tagged',
      content: 'Body',
      publicity: false,
      tags: Array.from({ length: 31 }, (_, index) => `tag-${index}`)
    })

    expect(result.success).toBe(false)
  })
})

describe('diaryUpdateSchema', () => {
  it('accepts a single changed field', () => {
    expect(diaryUpdateSchema.safeParse({ publicity: false }).success).toBe(true)
  })

  it('rejects unknown keys', () => {
    expect(diaryUpdateSchema.safeParse({ userId: 'someone' }).success).toBe(
      false
    )
  })
})

describe('parseDiaryFormData', () => {
  const buildFormData = (entries: Record<string, string>) => {
    const formData = new FormData()
    for (const [key, value] of Object.entries(entries)) {
      formData.set(key, value)
    }
    return formData
  }

  it('maps the publicity radio value to a boolean', () => {
    const asPublic = parseDiaryFormData(
      buildFormData({ title: 'T', content: 'C', publicity: 'public', tags: '' })
    )
    const asPrivate = parseDiaryFormData(
      buildFormData({
        title: 'T',
        content: 'C',
        publicity: 'private',
        tags: ''
      })
    )

    expect(asPublic.data?.publicity).toBe(true)
    expect(asPrivate.data?.publicity).toBe(false)
  })

  it('parses the comma-separated tag field', () => {
    const result = parseDiaryFormData(
      buildFormData({
        title: 'T',
        content: 'C',
        publicity: 'public',
        tags: 'a, b'
      })
    )

    expect(result.data?.tags).toEqual(['a', 'b'])
  })
})
