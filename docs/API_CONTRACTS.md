# API Contracts

Human index of every App Router handler under `src/app/api/**/route.ts`, the
Zod schema in [`src/contracts/`](../src/contracts) that describes its JSON, and
the fixture in [`src/test/mock-rest/api/`](../src/test/mock-rest/api) that mirrors it.

Three tests keep this table honest:

| Test                                          | Asserts                                                  |
| --------------------------------------------- | -------------------------------------------------------- |
| `src/test/mock-rest/routeCoverage.test.ts`    | Every handler has a fixture, minus documented exclusions |
| `src/test/mock-rest/catalogContracts.test.ts` | Every fixture body `safeParse`s against its contract     |
| `src/test/mock-rest/catalog.test.ts`          | The catalog loads and MSW query routing works            |

Dates cross the wire as ISO strings; `dateLikeSchema` also accepts `Date` so
handler tests can pass Mongoose documents directly.

---

## Blog

| Route                                      | Method | Status          | Body                                                                                         | Contract                    |
| ------------------------------------------ | ------ | --------------- | -------------------------------------------------------------------------------------------- | --------------------------- |
| `/api/blog`                                | GET    | 200             | `{ blogs, pagination }`, offset pagination; anonymous callers only see `status: 'published'` | `blogListResponseSchema`    |
| `/api/blog`                                | POST   | 201             | Created blog document                                                                        | `blogResponseSchema`        |
| `/api/blog`                                | POST   | 401 / 403 / 400 | `{ error }`                                                                                  | `errorResponseSchema`       |
| `/api/blog/[id]`                           | GET    | 200             | Single blog; view count incremented for published entries                                    | `blogResponseSchema`        |
| `/api/blog/[id]`                           | GET    | 401 / 403 / 404 | `{ error }`                                                                                  | `errorResponseSchema`       |
| `/api/blog/[id]`                           | PATCH  | 200             | Updated blog; body is `{ update: … }` validated by `blogUpdateSchema`                        | `blogResponseSchema`        |
| `/api/blog/[id]`                           | DELETE | 200             | `{ message: 'Blog deleted successfully' }`                                                   | `blogDeleteResponseSchema`  |
| `/api/blog/[id]/comments`                  | GET    | 200             | Array of top-level comments, each with one level of `replies`                                | `commentListResponseSchema` |
| `/api/blog/[id]/comments`                  | POST   | 201             | Created comment                                                                              | `commentResponseSchema`     |
| `/api/blog/[id]/comments/[commentId]/like` | POST   | 200             | `{ likes, liked }`                                                                           | `commentLikeResponseSchema` |

**Auth:** writes require an `Admin` record matched on the session email. Public
reads are filtered to `status: 'published'`.

## Diary

| Route                  | Method | Status          | Body                                                               | Contract                       |
| ---------------------- | ------ | --------------- | ------------------------------------------------------------------ | ------------------------------ |
| `/api/diary`           | GET    | 200             | `{ diaries, pagination }`, page-style pagination                   | `diaryListResponseSchema`      |
| `/api/diary`           | GET    | 500             | `{ msg: 'Database Error' }`                                        | `msgResponseSchema`            |
| `/api/diary/[id]/like` | POST   | 200             | `{ liked }`                                                        | `diaryLikeResponseSchema`      |
| `/api/diary/[id]/like` | POST   | 400 / 401 / 404 | `{ error }`                                                        | `errorResponseSchema`          |
| `/api/diary/stats`     | GET    | 200             | Totals, category and tag counts, word-count stats, recent activity | `diaryStatsResponseSchema`     |
| `/api/diary/snippets`  | GET    | 200             | `{ snippets, languages, pagination }`                              | `diarySnippetsResponseSchema`  |
| `/api/diary/resources` | GET    | 200             | `{ resources, types, pagination }`                                 | `diaryResourcesResponseSchema` |

**Auth:** `/api/diary` filters via `src/lib/diary-access.ts` — admins see
everything, signed-in users see public entries plus their own, anonymous
visitors see public entries only. The meta routes read the JWT with
`getToken` and return 401 without one.

## Contact

| Route               | Method | Status                | Body                                                | Contract                        |
| ------------------- | ------ | --------------------- | --------------------------------------------------- | ------------------------------- |
| `/api/contact`      | POST   | 200 / 400 / 403 / 500 | `{ msg: string[], success, emailSent? }`            | `contactSubmitResponseSchema`   |
| `/api/contact`      | GET    | 200                   | Array of messages                                   | `contactListResponseSchema`     |
| `/api/contact`      | GET    | 401                   | `{ msg: ['Unauthorized'], success: false }`         | `messageEnvelopeSchema`         |
| `/api/contact/[id]` | PATCH  | 200                   | Updated message; body is `{ read }` or `{ unread }` | `contactMutationResponseSchema` |
| `/api/contact/[id]` | DELETE | 200                   | Deleted message                                     | `contactMutationResponseSchema` |

**Auth:** POST is public and goes through Turnstile when both Turnstile keys are
set. Reads and mutations require `requireAdminSession()`.

**Note:** the 500 branches of `/api/contact` and `/api/contact/[id]` return the
plain text `Database Error`, not JSON.

## Photos

| Route              | Method | Status    | Body                                         | Contract                    |
| ------------------ | ------ | --------- | -------------------------------------------- | --------------------------- |
| `/api/photos`      | GET    | 200       | Array of photos, newest capture first        | `photoListResponseSchema`   |
| `/api/photos`      | POST   | 200       | Created photo; accepts `multipart/form-data` | `photoResponseSchema`       |
| `/api/photos`      | POST   | 400 / 401 | `{ error }`                                  | `errorResponseSchema`       |
| `/api/photos/[id]` | PUT    | 200       | Updated photo                                | `photoResponseSchema`       |
| `/api/photos/[id]` | DELETE | 200       | `{ message: 'Photo deleted successfully' }`  | `photoDeleteResponseSchema` |

**Auth:** every write requires `session.user.role === 'admin'`. Anonymous reads
are filtered to `isPublic: true`.

## Chess

| Route                                   | Method | Status          | Body                                                                        | Contract                      |
| --------------------------------------- | ------ | --------------- | --------------------------------------------------------------------------- | ----------------------------- |
| `/api/chess/repertoire`                 | GET    | 200             | `{ repertoire, success: true }`; creates a default repertoire on first read | `repertoireResponseSchema`    |
| `/api/chess/repertoire`                 | POST   | 200             | `{ repertoire, message, success: true }`                                    | `repertoireResponseSchema`    |
| `/api/chess/repertoire`                 | PATCH  | 200             | `{ repertoire, success: true }`; body is `{ update: { action, … } }`        | `repertoireResponseSchema`    |
| `/api/chess/repertoire`                 | PATCH  | 400 / 401 / 404 | `{ msg }`                                                                   | `msgResponseSchema`           |
| `/api/chess/repertoire/import`          | POST   | 200             | `{ repertoire, success: true }`                                             | `repertoireResponseSchema`    |
| `/api/chess/repertoire/import`          | POST   | 400 / 401 / 404 | `{ msg }`                                                                   | `msgResponseSchema`           |
| `/api/chess/repertoire/export/[lineId]` | GET    | 200             | **PGN text**, `Content-Type: application/x-chess-pgn`                       | `repertoireExportContentType` |
| `/api/chess/repertoire/export/[lineId]` | GET    | 400 / 401 / 404 | `{ msg }`                                                                   | `msgResponseSchema`           |

**Auth:** any session; `src/proxy.ts` already guards the `/chess` pages.

## Web3

| Route                  | Method | Status          | Body                              | Contract                       |
| ---------------------- | ------ | --------------- | --------------------------------- | ------------------------------ |
| `/api/eth-usd`         | GET    | 200             | `{ usd }`                         | `ethUsdResponseSchema`         |
| `/api/eth-usd`         | GET    | 502 / 500       | `{ msg, status?, data?, error? }` | `ethUsdErrorResponseSchema`    |
| `/api/eth-balance`     | GET    | 200             | `{ address, wei, eth }`           | `ethBalanceResponseSchema`     |
| `/api/eth-balance`     | GET    | 400 / 502       | `{ msg }`                         | `msgResponseSchema`            |
| `/api/eth-transaction` | GET    | 200             | `{ transaction }`, hex quantities | `ethTransactionResponseSchema` |
| `/api/eth-transaction` | GET    | 400 / 404 / 502 | `{ msg }`                         | `msgResponseSchema`            |

`/api/eth-usd` proxies CoinGecko. The other two proxy Etherscan so
`ETHERSCAN_API_KEY` stays server-side; the browser never talks to
`api.etherscan.io` directly.

Etherscan retired its V1 host, which answers every request with
`{ status: '0', result: 'You are using a deprecated V1 endpoint' }` at HTTP 200.
`unwrapEtherscanResult` and `unwrapEtherscanProxyResult` in `src/lib/etherscan.ts`
turn that envelope into a thrown error so a dead upstream cannot be rendered as
a zero balance or an empty transaction.

`wei` stays a string because a balance can exceed `Number.MAX_SAFE_INTEGER`.

All three handlers have Vitest coverage of their failure modes, with MSW
intercepting the upstream call, rather than being exercised in Playwright. The
e2e suite only asserts the validation rejections, which never reach an upstream.

---

## Excluded from the fixture catalog

| Route                     | Why                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| `/api/auth/[...nextauth]` | NextAuth v5 OAuth redirect flow — Playwright territory, and the app uses Google sign-in only |

`src/test/mock-rest/routeCoverage.test.ts` asserts this exclusion list stays
accurate in both directions: an excluded route must still exist as a handler,
and must still have no fixture.

## Fixture format

Each `route.json` holds one entry or an array of entries:

```json
{
  "route": "/api/diary",
  "method": "GET",
  "status": 200,
  "query": "",
  "delay": 0,
  "description": "Public diary list for anonymous visitors",
  "responseBody": { "diaries": [], "pagination": {} }
}
```

- `route` uses MSW parameter syntax (`/api/blog/:id`) and must match the folder
  path, where `[id]` maps to `:id`.
- `query` selects between fixtures for the same route; an empty string is the
  catch-all and is registered last.
- `contentType` opts out of JSON, as the PGN export fixture does.
