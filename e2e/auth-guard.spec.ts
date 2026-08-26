import { expect, test } from '@playwright/test'

/** Routes guarded by `src/proxy.ts` for signed-out visitors. */
const guardedRoutes = [
  '/chess',
  '/mails',
  '/diary',
  '/diary/000000000000000000000000/edit'
]

test.describe('auth guard', () => {
  for (const route of guardedRoutes) {
    test(`${route} redirects signed-out visitors home`, async ({ page }) => {
      await page.goto(route)

      await expect(page).toHaveURL(/\/$/)
      await expect(page.locator('main')).toBeVisible()
    })
  }

  test('public diary listing stays accessible', async ({ page }) => {
    const response = await page.goto('/diaries')

    expect(response?.status()).toBeLessThan(400)
    await expect(page).toHaveURL(/\/diaries$/)
  })
})
