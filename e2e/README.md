# End-to-end tests

Playwright specs for the Apple-UI portfolio. Implements § 7.5 of
[`requirements/TESTING_ARCHITECTURE.md`](../requirements/TESTING_ARCHITECTURE.md).

## Running

```bash
yarn test:e2e:install   # one-time: download Chromium
yarn test:func          # runner + optional Docker Mongo + Playwright
yarn test:e2e:ui        # same, with the Playwright UI
```

`scripts/run-func-tests.ts` starts MongoDB from `docker-compose.e2e.yml` when
nothing is listening on `127.0.0.1:27017`. Set `E2E_SKIP_DOCKER_MONGO=1` when
Mongo runs elsewhere (Atlas, a local service, an existing container).

Playwright boots the app itself via `webServer` → `yarn dev` on
**http://localhost:4000**, reusing an already-running dev server outside CI.

The base URL comes from `E2E_BASE_URL` (default `http://localhost:$PORT`) and
deliberately ignores `NEXT_PUBLIC_APP_URL`: that variable points at production,
and combined with `reuseExistingServer` it would run the whole suite against the
live site.

## Auth strategy — Option C

`src/auth.ts` registers **Google OAuth only**; there is no credentials
provider. Rather than weaken production auth for tests, this suite implements
**Option C** from the architecture doc:

- E2E covers the **public** and **auth-guard redirect** tiers only.
- Authenticated behaviour is covered in Vitest with a mocked `auth()` —
  see the route handler tests under `src/app/api/**/route.test.ts`.

`scripts/seed-e2e-user.ts` (`yarn seed:e2e`) exists so an authenticated tier can
be added later without re-deriving the seed shape. It refuses to run unless
`E2E_SEED_ENABLED=1` and `MONGODB_URI` points at an obvious test database.

Switching to **Option A** would mean adding an E2E-only credentials provider
gated behind `E2E_SEED_ENABLED=1`, then storing a Playwright `storageState`.

## Turnstile

`playwright.config.ts` injects Cloudflare's always-pass dev keys into the dev
server unless real values are already present:

| Key                              | Value                                 |
| -------------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `1x00000000000000000000BB`            |
| `TURNSTILE_SECRET_KEY`           | `1x0000000000000000000000000000000AA` |

The site key is the **invisible** always-pass variant. The visible one
(`...AA`) renders a checkbox that never resolves on its own in headless
Chromium, so the form would stay blocked on a missing token.

## Specs

| Spec                   | Tier                                                                         |
| ---------------------- | ---------------------------------------------------------------------------- |
| `smoke.spec.ts`        | Shell renders, no uncaught errors                                            |
| `public-pages.spec.ts` | `/privacy`, `/terms`, `/portfolio`, `/blog`, `/diaries`, `/contact`, `/web3` |
| `public-api.spec.ts`   | `/api/diary`, `/api/blog` + 401s for guarded reads                           |
| `auth-guard.spec.ts`   | `src/proxy.ts` redirects for `/chess`, `/mails`, `/diary`                    |
| `contact.spec.ts`      | Contact validation with Turnstile test keys                                  |

## Deliberately not covered here

Covered by Vitest instead (§ 15 of the architecture doc):

- Google OAuth sign-in UI — external provider
- TinyMCE blog authoring — iframe-heavy editor
- Photo EXIF + R2 upload — binary and Sharp pipeline
- Chess PGN import file picker — file input plus large trees
- `/api/eth-usd` failure modes — CoinGecko stubbed in unit tests
