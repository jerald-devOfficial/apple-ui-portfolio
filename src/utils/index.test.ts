import { TEST_ORIGIN } from '@/test/handlerRequest'
import { mswServer } from '@/test/msw/nodeServer'
import {
  arrGenerator,
  classNames,
  fetchExchangeRateFromAPI,
  formatDate,
  formatDiaryDate,
  formatEthValue,
  getInitials,
  getRandomHexColor,
  hashShortener,
  hoursAgo,
  toFixedFour
} from '@/utils'
import { HttpResponse, http } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('arrGenerator', () => {
  it('produces a one-based sequence', () => {
    expect(arrGenerator(3)).toEqual([1, 2, 3])
  })

  it('produces an empty array for zero', () => {
    expect(arrGenerator(0)).toEqual([])
  })
})

describe('getInitials', () => {
  it('uppercases the first letter of each word', () => {
    expect(getInitials('jerald baroro')).toBe('JB')
  })

  it('handles a single name', () => {
    expect(getInitials('cher')).toBe('C')
  })
})

describe('getRandomHexColor', () => {
  it('always returns six hex digits', () => {
    for (let i = 0; i < 50; i++) {
      expect(getRandomHexColor()).toMatch(/^[0-9a-f]{6}$/)
    }
  })
})

describe('classNames', () => {
  it('joins truthy classes only', () => {
    expect(classNames('a', '', 'b')).toBe('a b')
  })
})

describe('fetchExchangeRateFromAPI', () => {
  const respondWith = (body: unknown, status = 200) =>
    mswServer.use(
      http.get(`${TEST_ORIGIN}/api/eth-usd`, () =>
        HttpResponse.json(body as Record<string, unknown>, { status })
      )
    )

  it('returns the quoted price', async () => {
    respondWith({ usd: 3421.55 })

    await expect(fetchExchangeRateFromAPI()).resolves.toBe(3421.55)
  })

  /**
   * Returning `undefined` here used to be indistinguishable from a price of
   * zero by the time it reached the wallet panels.
   */
  it('throws with the proxy message when the lookup fails', async () => {
    respondWith({ msg: 'Failed to fetch from CoinGecko' }, 502)

    await expect(fetchExchangeRateFromAPI()).rejects.toThrow(
      'Failed to fetch from CoinGecko'
    )
  })

  it('throws when a 200 response carries no usable price', async () => {
    respondWith({ usd: null })

    await expect(fetchExchangeRateFromAPI()).rejects.toThrow(
      'Failed to fetch the ETH price'
    )
  })
})

describe('formatEthValue', () => {
  it('pads short values to four decimals', () => {
    expect(formatEthValue(1.5)).toBe('1.5000')
    expect(formatEthValue(2)).toBe('2.0000')
  })

  it('truncates rather than rounds long values', () => {
    expect(formatEthValue(1.23456789)).toBe('1.2345')
  })
})

describe('toFixedFour', () => {
  it('accepts numbers and numeric strings', () => {
    expect(toFixedFour(1.23456)).toBe('1.2346')
    expect(toFixedFour('2.5')).toBe('2.5000')
  })

  it('returns an empty string for non-numeric input', () => {
    expect(toFixedFour('not a number')).toBe('')
  })
})

describe('hashShortener', () => {
  it('keeps the head and tail around an ellipsis', () => {
    expect(hashShortener('0x1234567890abcdef', 4)).toBe('0x12...cdef')
  })

  it('accepts a separate tail length', () => {
    expect(hashShortener('0x1234567890abcdef', 4, 2)).toBe('0x12...ef')
  })
})

describe('date helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('counts whole hours elapsed', () => {
    expect(hoursAgo(new Date('2024-06-15T09:30:00.000Z'))).toBe(2)
  })

  it('formats today as a time', () => {
    expect(formatDate(new Date('2024-06-15T12:00:00.000Z'))).toMatch(
      /^\d{1,2}:\d{2} (AM|PM)$/
    )
  })

  it('formats an earlier day this year as month and day', () => {
    expect(formatDate(new Date('2024-01-05T12:00:00.000Z'))).toMatch(
      /^Jan \d{1,2}$/
    )
  })

  it('formats a previous year with a numeric date', () => {
    expect(formatDate(new Date('2023-01-05T12:00:00.000Z'))).toMatch(
      /^\d{2}\/\d{1,2}\/\d{2}$/
    )
  })

  it('prefixes today’s diary entries with "Today at"', () => {
    expect(formatDiaryDate(new Date('2024-06-15T12:00:00.000Z'))).toMatch(
      /^Today at /
    )
  })

  it('includes the year for diary entries from previous years', () => {
    expect(formatDiaryDate(new Date('2022-03-02T12:00:00.000Z'))).toMatch(
      /2022/
    )
  })
})
