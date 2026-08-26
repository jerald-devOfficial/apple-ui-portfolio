import {
  blogUpdateSchema,
  blogWriteSchema,
  parseBlogFormData,
  slugFromTitle
} from '@/lib/blog-fields'
import { describe, expect, it } from 'vitest'

const buildFormData = (entries: Record<string, string>) => {
  const formData = new FormData()
  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value)
  }
  return formData
}

describe('slugFromTitle', () => {
  it('lowercases and hyphenates', () => {
    expect(slugFromTitle('Hello World')).toBe('hello-world')
  })

  it('collapses punctuation and trims stray hyphens', () => {
    expect(slugFromTitle('  Next.js 16: What’s New?! ')).toBe(
      'next-js-16-what-s-new'
    )
  })
})

describe('blogWriteSchema', () => {
  it('applies defaults for optional fields', () => {
    const result = blogWriteSchema.safeParse({
      title: 'A post',
      summary: 'A summary'
    })

    expect(result.success).toBe(true)
    expect(result.data).toMatchObject({
      content: '',
      contentBlocks: [],
      tags: [],
      status: 'draft'
    })
  })

  it('rejects an unknown status', () => {
    const result = blogWriteSchema.safeParse({
      title: 'A post',
      summary: 'A summary',
      status: 'archived'
    })

    expect(result.success).toBe(false)
  })

  it('validates content blocks', () => {
    const result = blogWriteSchema.safeParse({
      title: 'A post',
      summary: 'A summary',
      contentBlocks: [
        { id: 'b1', type: 'code', content: 'const a = 1', order: 0 }
      ]
    })

    expect(result.success).toBe(true)
  })

  it('rejects content blocks with an unknown type', () => {
    const result = blogWriteSchema.safeParse({
      title: 'A post',
      summary: 'A summary',
      contentBlocks: [{ id: 'b1', type: 'audio', content: '', order: 0 }]
    })

    expect(result.success).toBe(false)
  })
})

describe('blogUpdateSchema', () => {
  it('accepts a partial update with slug and featured flag', () => {
    const result = blogUpdateSchema.safeParse({
      title: 'Renamed',
      slug: 'renamed',
      featured: true
    })

    expect(result.success).toBe(true)
  })

  it('rejects unknown keys', () => {
    const result = blogUpdateSchema.safeParse({ nope: true })

    expect(result.success).toBe(false)
  })
})

describe('parseBlogFormData', () => {
  it('splits tags and drops empty entries', () => {
    const result = parseBlogFormData(
      buildFormData({
        title: 'A post',
        summary: 'A summary',
        content: '<p>Body</p>',
        tags: 'next, , react ,'
      })
    )

    expect(result.success).toBe(true)
    expect(result.data?.tags).toEqual(['next', 'react'])
  })

  it('falls back to an empty block list when the JSON is malformed', () => {
    const result = parseBlogFormData(
      buildFormData({
        title: 'A post',
        summary: 'A summary',
        content: '<p>Body</p>',
        contentBlocks: '{not json'
      })
    )

    expect(result.success).toBe(true)
    expect(result.data?.contentBlocks).toEqual([])
  })

  it('defaults the category to technology', () => {
    const result = parseBlogFormData(
      buildFormData({ title: 'A post', summary: 'A summary' })
    )

    expect(result.data?.category).toBe('technology')
  })

  it('omits an empty cover image rather than sending a blank string', () => {
    const result = parseBlogFormData(
      buildFormData({ title: 'A post', summary: 'A summary', coverImage: '  ' })
    )

    expect(result.data?.coverImage).toBeUndefined()
  })

  it('fails when the title is missing', () => {
    const result = parseBlogFormData(buildFormData({ summary: 'A summary' }))

    expect(result.success).toBe(false)
  })
})
