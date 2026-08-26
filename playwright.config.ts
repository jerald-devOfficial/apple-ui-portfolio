import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config({ path: '.env', quiet: true })
dotenv.config({ path: '.env.local', override: true, quiet: true })

const PORT = Number(process.env.PORT ?? 4000)

/**
 * Always the local dev server unless E2E_BASE_URL says otherwise.
 * `NEXT_PUBLIC_APP_URL` deliberately is not a fallback: it points at
 * production, and reuseExistingServer would then silently run the suite
 * against the live site.
 */
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'yarn dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      // Cloudflare Turnstile dev keys — always pass, never call the real API.
      // `...BB` is the invisible variant: it issues a token without waiting for
      // a click, which the visible widget will not do in a headless browser.
      NEXT_PUBLIC_TURNSTILE_SITE_KEY:
        process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ??
        '1x00000000000000000000BB',
      TURNSTILE_SECRET_KEY:
        process.env.TURNSTILE_SECRET_KEY ??
        '1x0000000000000000000000000000000AA'
    }
  }
})
