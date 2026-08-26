# Troubleshooting

Quick fixes for local development, tests, and git hooks. Commands assume you are
in the repo root and use **Yarn 4** (`packageManager` in `package.json`).

The dev server runs on **port 4000** (`yarn dev`), not 3000. E2E MongoDB uses
**port 27017** when started via Docker.

---

## Quick reference

| Problem                              | Fix                                                         |
| ------------------------------------ | ----------------------------------------------------------- |
| Dev server won't start — port in use | `yarn dev:kill` then `yarn dev`                             |
| Stale Next.js build / weird HMR      | `yarn clean` then `yarn dev`                                |
| Type or lint errors after pulling    | `yarn install && yarn typecheck && yarn lint`               |
| Unit tests fail mysteriously         | `yarn test:watch` or `yarn test -- --clearCache`            |
| E2E can't reach Mongo                | See [MongoDB & Docker](#mongodb--docker)                    |
| Playwright browser missing           | `yarn test:e2e:install`                                     |
| Commit blocked by hooks              | Fix the error, or `git commit --no-verify` (emergency only) |
| Push blocked by `yarn validate`      | Run `yarn validate` locally and fix the first failing step  |
| Auth redirect loops locally          | Check `NEXT_PUBLIC_APP_URL=http://localhost:4000` in `.env` |

---

## Dev server

### Start

```bash
yarn dev
```

Opens at [http://localhost:4000](http://localhost:4000).

Playwright reuses an already-running dev server when not in CI (`reuseExistingServer`).
If you started `yarn dev` yourself, E2E will attach to it instead of spawning another.

### Kill a stuck dev server

**Preferred (cross-platform, via npm script):**

```bash
yarn dev:kill
```

This runs `npx kill-port 4000` and frees the port Next.js binds to.

**Git Bash / WSL — find and kill by port:**

```bash
npx --yes kill-port 4000
```

**Windows PowerShell — manual:**

```powershell
netstat -ano | findstr :4000
taskkill /PID <pid> /F
```

**macOS / Linux:**

```bash
lsof -ti :4000 | xargs kill -9
```

### Port already in use (EADDRINUSE)

1. Run `yarn dev:kill`.
2. If it persists, another process may hold 4000 — use the manual commands above.
3. Or temporarily use a different port: `PORT=4001 yarn dev` (update
   `NEXT_PUBLIC_APP_URL` to match if testing auth callbacks).

---

## Next.js cache

Symptoms: old routes, missing components after rename, Turbopack acting odd,
build succeeds but dev shows outdated UI.

```bash
yarn clean          # remove .next/
yarn dev            # cold start
```

For a deeper reset (slow — reinstalls dependencies):

```bash
yarn clean:all
yarn install
yarn dev
```

---

## Dependencies & Yarn

### After pulling or switching branches

```bash
yarn install
yarn typecheck
```

### Node version mismatch

This project targets **Node 24.x** (`engines` in `package.json`). Check:

```bash
node -v
```

Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to
switch versions if hooks or `yarn validate` fail with obscure native/addon errors.

### Corrupted install

```bash
yarn clean:all
yarn install
```

---

## Environment variables

Copy the template and fill in values:

```bash
cp .env.example .env
```

| Variable                                | Local dev note                                                      |
| --------------------------------------- | ------------------------------------------------------------------- |
| `MONGODB_URI`                           | Required for API routes that touch the database                     |
| `NEXT_PUBLIC_APP_URL`                   | Must be `http://localhost:4000` (matches `yarn dev`)                |
| `AUTH_SECRET`                           | Required for NextAuth session signing                               |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth — sign-in fails without them                           |
| Turnstile keys                          | Use Cloudflare test keys from `.env.example` for local contact form |
| R2 / Resend keys                        | Optional for local dev unless testing uploads or email              |

**Load order:** `.env` first, then `.env.local` overrides (see `playwright.config.ts`).

Do not point `MONGODB_URI` at production when running `yarn test:func` or
`yarn seed:e2e`. See [`e2e/README.md`](../e2e/README.md).

---

## MongoDB & Docker

E2E tests use `scripts/run-func-tests.ts`, which starts Mongo from
`docker-compose.e2e.yml` when nothing listens on `127.0.0.1:27017`.

### Start E2E Mongo manually

```bash
docker compose -f docker-compose.e2e.yml up -d
```

### Stop E2E Mongo

```bash
yarn mongo:down
# or
docker compose -f docker-compose.e2e.yml down
```

### Reset E2E Mongo data (wipes the Docker volume)

```bash
yarn mongo:reset
```

### Skip Docker Mongo (Atlas or local Mongo already running)

Set in `.env`:

```bash
E2E_SKIP_DOCKER_MONGO=1
```

### Port 27017 already in use

Another Mongo instance (Docker, Windows service, or Atlas tunnel) owns the port.
Either stop it, or set `E2E_SKIP_DOCKER_MONGO=1` if your existing instance is the
one tests should use.

Check what's listening:

```bash
# Git Bash / macOS / Linux
npx --yes kill-port 27017   # only if you intend to free the port

# Windows PowerShell
netstat -ano | findstr :27017
```

### Docker not running

`yarn test:func` logs `[func-tests] Docker not available` and exits if Mongo isn't
reachable and Docker can't start the compose stack. Start Docker Desktop, or run
Mongo another way and set `E2E_SKIP_DOCKER_MONGO=1`.

---

## Testing

### Unit & integration (Vitest)

```bash
yarn test              # run once
yarn test:watch        # watch mode
yarn test:unit         # unit project only
yarn test:coverage     # with coverage report
```

Run a single file:

```bash
yarn test src/lib/utils.test.ts
```

Clear Vitest cache if tests behave inconsistently:

```bash
yarn test -- --clearCache
```

### End-to-end (Playwright)

```bash
yarn test:e2e:install   # one-time Chromium download
yarn test:func          # Docker Mongo (optional) + Playwright
yarn test:e2e:ui        # Playwright UI mode
```

Clear Playwright artifacts:

```bash
yarn clean:test
```

**Suite runs against production by mistake:** Playwright uses `E2E_BASE_URL`, not
`NEXT_PUBLIC_APP_URL`. Never set `E2E_BASE_URL` to your live site unless you mean
to hit production. See [`e2e/README.md`](../e2e/README.md).

**Contact form blocked in E2E:** Playwright injects Cloudflare always-pass Turnstile
test keys. If you override them in `.env.local` with real keys, headless runs may hang.

### Full validation (same as pre-push hook)

```bash
yarn validate
```

Runs format check → lint → typecheck → unit tests → e2e → production build.
Fix failures in order; the first error is usually the root cause.

---

## Git hooks

Hooks are defined in `.husky/`. Installed automatically on `yarn install`.

| Hook         | Command                            | When it blocks                                    |
| ------------ | ---------------------------------- | ------------------------------------------------- |
| `pre-commit` | lint-staged, typecheck, unit tests | ESLint/Prettier can't fix, types fail, tests fail |
| `commit-msg` | commitlint                         | Not a Conventional Commit or header > 72 chars    |
| `pre-push`   | `yarn validate`                    | Any step in the full validate chain fails         |

**Emergency bypass (local only — CI still runs validate):**

```bash
git commit --no-verify
git push --no-verify
```

**Commit message format:**

```bash
feat(blog): add draft autosave
fix(contact): validate Turnstile token
```

---

## Build & production

### Local production build

```bash
yarn build
yarn start    # serves on default Next.js port 3000 unless PORT is set
```

If `yarn build` fails after a large refactor:

```bash
yarn clean
yarn build
```

### Type errors only in CI

Run locally:

```bash
yarn typecheck
```

Ensure `yarn install` completed and your editor isn't hiding errors suppressed in
IDE but not in `tsconfig.json`.

---

## Runtime issues

### Google sign-in redirect mismatch

OAuth redirect URIs must match `NEXT_PUBLIC_APP_URL`. For local dev:

- App URL: `http://localhost:4000`
- Google Cloud Console → Authorized redirect URI:
  `http://localhost:4000/api/auth/callback/google`

### API returns 500 — database

Check `MONGODB_URI` is set and reachable. Connection errors often surface in the
terminal running `yarn dev`.

### Contact form — Turnstile / validation

Local dev: use test keys from `.env.example` (always pass). Production keys against
`localhost` will fail unless the Turnstile site allows that domain.

### Photo upload / R2 errors

R2 env vars (`CLOUDFLARE_*`, `NEXT_PUBLIC_R2_URL`) must be set. Missing bucket
credentials produce 500s from `/api/photos`.

### Web3 / ETH price not loading

`/api/eth-usd` calls CoinGecko. Network blocks or rate limits show as client errors;
unit tests stub this endpoint — see `src/test/mock-rest/api/eth-usd/route.json`.

---

## Utility scripts

| Script             | What it does                                                                   |
| ------------------ | ------------------------------------------------------------------------------ |
| `yarn dev:kill`    | Free port 4000                                                                 |
| `yarn clean`       | Delete `.next/`                                                                |
| `yarn clean:test`  | Delete coverage, Playwright reports, test-results                              |
| `yarn clean:all`   | Delete `.next/`, `node_modules/`, and test artifacts — then run `yarn install` |
| `yarn mongo:down`  | Stop E2E Docker Mongo                                                          |
| `yarn mongo:reset` | Stop E2E Mongo and wipe its volume                                             |
| `yarn seed:e2e`    | Seed test user (requires `E2E_SEED_ENABLED=1` + test DB URI)                   |

### One-off maintenance

Contact spam cleanup (requires `MONGODB_URI`):

```bash
node scripts/cleanup-contacts.mjs          # dry run
node scripts/cleanup-contacts.mjs --delete # actually delete
```

---

## Related docs

- [`e2e/README.md`](../e2e/README.md) — Playwright setup, auth strategy, Turnstile
- [`requirements/TESTING_ARCHITECTURE.md`](../requirements/TESTING_ARCHITECTURE.md) — test tiers
- [`.env.example`](../.env.example) — all environment variables
- [`README.md`](../README.md) — quality gates and hook overview
