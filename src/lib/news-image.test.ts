import {
  NEWS_IMAGE_PLACEHOLDER,
  isDisplayableNewsImage,
  resolveNewsImage
} from '@/lib/news-image'
import { describe, expect, it } from 'vitest'

describe('isDisplayableNewsImage', () => {
  it('accepts an https image URL', () => {
    expect(
      isDisplayableNewsImage('https://images.example.com/story/photo.jpg')
    ).toBe(true)
  })

  it('accepts every extension the feed serves', () => {
    for (const extension of [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'bmp',
      'webp',
      'avif'
    ]) {
      expect(
        isDisplayableNewsImage(`https://images.example.com/photo.${extension}`)
      ).toBe(true)
    }
  })

  it('ignores a query string when checking the extension', () => {
    expect(
      isDisplayableNewsImage('https://images.example.com/photo.png?w=600')
    ).toBe(true)
  })

  // The crash this helper exists to prevent: next/image only allows https
  // hosts, so an http URL throws "Invalid src prop" at render time.
  it('rejects a plain http image URL', () => {
    expect(
      isDisplayableNewsImage(
        'http://express-press-release.net/news/wp-content/uploads/2015/11/epr-network-big-logo.jpg'
      )
    ).toBe(false)
  })

  it('rejects a URL without an image extension', () => {
    expect(isDisplayableNewsImage('https://example.com/story')).toBe(false)
  })

  it('rejects the excluded host', () => {
    expect(isDisplayableNewsImage('https://cdn.openpr.com/photo.jpg')).toBe(
      false
    )
  })

  it('rejects a value that is not a URL', () => {
    expect(isDisplayableNewsImage('/local/photo.jpg')).toBe(false)
    expect(isDisplayableNewsImage('not a url')).toBe(false)
  })

  it('rejects a missing URL', () => {
    expect(isDisplayableNewsImage(null)).toBe(false)
    expect(isDisplayableNewsImage(undefined)).toBe(false)
    expect(isDisplayableNewsImage('')).toBe(false)
  })
})

describe('resolveNewsImage', () => {
  it('returns the article image when it is displayable', () => {
    expect(resolveNewsImage('https://images.example.com/photo.jpg')).toBe(
      'https://images.example.com/photo.jpg'
    )
  })

  it('falls back to the placeholder otherwise', () => {
    expect(resolveNewsImage('http://insecure.example.com/photo.jpg')).toBe(
      NEWS_IMAGE_PLACEHOLDER
    )
    expect(resolveNewsImage(null)).toBe(NEWS_IMAGE_PLACEHOLDER)
  })
})
