import { photoUploadFieldsSchema } from '@/lib/photo-upload-validation'
import { describe, expect, it } from 'vitest'

describe('photoUploadFieldsSchema', () => {
  it('accepts the minimum viable upload metadata', () => {
    const result = photoUploadFieldsSchema.safeParse({
      title: 'Sunset',
      isPublic: true
    })

    expect(result.success).toBe(true)
    expect(result.data?.description).toBe('')
  })

  it('requires a title', () => {
    const result = photoUploadFieldsSchema.safeParse({
      title: '   ',
      isPublic: false
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('Title is required')
  })

  it('rejects a title longer than 200 characters', () => {
    const result = photoUploadFieldsSchema.safeParse({
      title: 'a'.repeat(201),
      isPublic: false
    })

    expect(result.success).toBe(false)
  })

  it('accepts an ISO capture date', () => {
    const result = photoUploadFieldsSchema.safeParse({
      title: 'Sunset',
      isPublic: true,
      capturedAt: '2024-05-01T10:30:00.000Z'
    })

    expect(result.success).toBe(true)
  })

  it('rejects an unparsable capture date', () => {
    const result = photoUploadFieldsSchema.safeParse({
      title: 'Sunset',
      isPublic: true,
      capturedAt: 'last tuesday'
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('Invalid capture date')
  })

  it('treats an omitted capture date as valid', () => {
    expect(
      photoUploadFieldsSchema.safeParse({ title: 'Sunset', isPublic: false })
        .success
    ).toBe(true)
  })
})
