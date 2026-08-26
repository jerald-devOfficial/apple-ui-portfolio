import { expect, test } from '@playwright/test'

/**
 * Dev-server noise that says nothing about application health.
 */
const IGNORED_CONSOLE_PATTERNS = [
  /Download the React DevTools/i,
  /favicon/i,
  /net::ERR_/i,
  /Failed to load resource/i,
  /\[Fast Refresh\]/i
]

const isIgnorable = (text: string) =>
  IGNORED_CONSOLE_PATTERNS.some((pattern) => pattern.test(text))

test.describe('smoke', () => {
  test('home shell renders without uncaught errors', async ({ page }) => {
    const pageErrors: string[] = []
    const consoleErrors: string[] = []

    page.on('pageerror', (error) => pageErrors.push(error.message))
    page.on('console', (message) => {
      if (message.type() !== 'error') return
      if (isIgnorable(message.text())) return
      consoleErrors.push(message.text())
    })

    await page.goto('/')

    await expect(page).toHaveTitle(/Jerald/i)
    await expect(page.locator('main')).toBeVisible()

    expect(pageErrors).toEqual([])
    expect(consoleErrors).toEqual([])
  })

  test('home exposes the public app icons', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('link', { name: 'Blog' }).first()).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Diaries' }).first()
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'News' }).first()).toBeVisible()
  })

  test('signed-out visitors do not see auth-only icons', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('link', { name: 'Chess' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Mails' })).toHaveCount(0)
  })
})
