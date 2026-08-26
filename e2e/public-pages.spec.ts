import { expect, test } from '@playwright/test'

const staticPages = [
  { path: '/privacy', heading: 'Privacy Policy' },
  { path: '/terms', heading: 'Terms of Service' },
  { path: '/portfolio', heading: 'Portfolio' }
]

/** These render from MongoDB, so they only need to load and show their shell. */
const dataBackedPages = [
  { path: '/blog', heading: 'Blog' },
  { path: '/diaries', heading: 'Diaries' }
]

test.describe('public pages', () => {
  for (const { path, heading } of staticPages) {
    test(`${path} renders its heading`, async ({ page }) => {
      const response = await page.goto(path)

      expect(response?.status()).toBeLessThan(400)
      await expect(
        page.getByRole('heading', { name: heading, exact: false }).first()
      ).toBeVisible()
    })
  }

  for (const { path, heading } of dataBackedPages) {
    test(`${path} renders its heading`, async ({ page }) => {
      const response = await page.goto(path)

      expect(response?.status()).toBeLessThan(400)
      await expect(
        page.getByRole('heading', { name: heading, exact: false }).first()
      ).toBeVisible()
    })
  }

  test('/contact shows the message form for signed-out visitors', async ({
    page
  }) => {
    await page.goto('/contact')

    await expect(
      page.getByRole('heading', { name: 'Write me a message' })
    ).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('textarea[name="message"]')).toBeVisible()
  })

  test('/web3 renders', async ({ page }) => {
    const response = await page.goto('/web3')

    expect(response?.status()).toBeLessThan(400)
    await expect(page.locator('main')).toBeVisible()
  })
})
