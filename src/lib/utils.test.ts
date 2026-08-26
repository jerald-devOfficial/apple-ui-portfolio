import { formatDate } from '@/lib/utils'
import { describe, expect, it } from 'vitest'

describe('formatDate', () => {
  it('formats an ISO string as a long US date', () => {
    expect(formatDate('2024-05-01T10:30:00.000Z')).toMatch(/May 1, 2024/)
  })

  it('formats a Date instance', () => {
    expect(formatDate(new Date('2024-12-25T00:00:00.000Z'))).toMatch(
      /December 2[45], 2024/
    )
  })

  it('returns an empty string for a falsy value', () => {
    expect(formatDate('')).toBe('')
  })
})
