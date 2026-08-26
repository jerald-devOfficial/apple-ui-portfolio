import { expect, test, type Page } from '@playwright/test'

/**
 * Turnstile runs with Cloudflare's always-pass dev keys (see
 * `playwright.config.ts` → `webServer.env`), so the widget resolves on its own.
 * When no site key is configured the form skips the widget entirely.
 */
const waitForTurnstile = async (page: Page) => {
  const scriptLoaded = await page
    .waitForFunction(
      () => Boolean((window as { turnstile?: unknown }).turnstile),
      undefined,
      { timeout: 10_000 }
    )
    .then(() => true)
    .catch(() => false)

  // No site key configured — the form renders without the widget.
  if (!scriptLoaded) return

  // The form blocks submission until the widget hands back a token.
  await expect
    .poll(() => page.locator('input[name="turnstileToken"]').inputValue(), {
      timeout: 30_000
    })
    .not.toBe('')
}

const fillContactForm = async (
  page: Page,
  values: { email: string; fullName: string; subject: string; message: string }
) => {
  await page.locator('input[name="email"]').fill(values.email)
  await page.locator('input[name="fullName"]').fill(values.fullName)
  await page.locator('input[name="subject"]').fill(values.subject)
  await page.locator('textarea[name="message"]').fill(values.message)
}

test.describe('contact form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact')
    await expect(
      page.getByRole('heading', { name: 'Write me a message' })
    ).toBeVisible()
  })

  test('blocks submission until required fields are filled', async ({
    page
  }) => {
    await page.locator('form button[type="submit"]').click()

    // Native constraint validation keeps us on the page with an empty email.
    await expect(page).toHaveURL(/\/contact$/)
    await expect(page.locator('input[name="email"]')).toHaveValue('')
    await expect(page.locator('textarea[name="message"]')).toHaveValue('')
  })

  test('rejects a message containing a link', async ({ page }) => {
    await fillContactForm(page, {
      email: 'e2e.visitor@gmail.com',
      fullName: 'E2E Visitor',
      subject: 'Playwright coverage check',
      message: 'Please review https://example.com for more details about this.'
    })

    await waitForTurnstile(page)
    await page.locator('form button[type="submit"]').click()

    await expect(
      page.getByText('Message cannot contain links.', { exact: false })
    ).toBeVisible({ timeout: 20_000 })
  })

  test('rejects an invalid full name', async ({ page }) => {
    await fillContactForm(page, {
      email: 'e2e.visitor@gmail.com',
      fullName: 'a1',
      subject: 'Playwright coverage check',
      message: 'This message is long enough to pass the minimum length rule.'
    })

    await waitForTurnstile(page)
    await page.locator('form button[type="submit"]').click()

    await expect(
      page
        .getByText(
          /Name may only contain letters|Please enter your full name|Name must be/i
        )
        .first()
    ).toBeVisible({ timeout: 20_000 })
  })
})
