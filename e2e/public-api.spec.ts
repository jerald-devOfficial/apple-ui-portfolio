import { expect, test } from '@playwright/test'

test.describe('public API', () => {
  test('GET /api/diary returns a paginated list', async ({ page }) => {
    const response = await page.request.get('/api/diary')

    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(Array.isArray(body.diaries)).toBe(true)
    expect(body.pagination).toMatchObject({ currentPage: 1 })
  })

  test('GET /api/blog returns published entries only', async ({ page }) => {
    const response = await page.request.get('/api/blog')

    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(Array.isArray(body.blogs)).toBe(true)

    for (const blog of body.blogs) {
      expect(blog.status).toBe('published')
    }
  })

  test('GET /api/contact rejects unauthenticated readers', async ({ page }) => {
    const response = await page.request.get('/api/contact')

    expect(response.status()).toBe(401)
  })

  test('GET /api/chess/repertoire rejects unauthenticated readers', async ({
    page
  }) => {
    const response = await page.request.get('/api/chess/repertoire')

    expect(response.status()).toBe(401)
  })

  // The success paths depend on Etherscan, so only the validation rejections —
  // which never reach the upstream — are asserted here.
  test('GET /api/eth-balance rejects a malformed address', async ({ page }) => {
    const response = await page.request.get('/api/eth-balance?address=nope')

    expect(response.status()).toBe(400)
  })

  test('GET /api/eth-transaction rejects a malformed hash', async ({
    page
  }) => {
    const response = await page.request.get('/api/eth-transaction?hash=0x12')

    expect(response.status()).toBe(400)
  })
})
