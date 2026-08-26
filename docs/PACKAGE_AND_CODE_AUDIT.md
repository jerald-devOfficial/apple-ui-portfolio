# Package & Code Audit

**Date:** 2026-08-14 (updated after upgrade)  
**Scope:** `package.json` versions vs latest stable, deprecated/unused deps, and React/Next patterns that should be refactored.  
**Companion:** [REACT_NEXT_FEATURES.md](./REACT_NEXT_FEATURES.md)

> **Status:** Framework upgrade and Phase A–C refactors applied. App is on **Next.js 16.2.10** + **React 19.2.7**. Web3 uses **viem + injected MetaMask** (wagmi and TanStack Query removed). Remaining majors (mongoose 9, date-fns 4, isomorphic-dompurify 3) are still deferred.

---

## Executive summary

| Area                          | Verdict                                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Next.js**                   | **Done** — on **16.2.10** (`middleware` → `proxy.ts`, ESLint 9 flat config).                                                                                 |
| **React**                     | **Done** — on **19.2.7** (`useEffectEvent`, `useOptimistic`, `useActionState`, `useMounted`).                                                                |
| **Can update most packages?** | Phase A–C applied. Avoid blind majors for `mongoose` 9, `typescript` 7, `date-fns` 4 without regression tests.                                               |
| **Deprecated / dead weight**  | **Removed:** `@walletconnect/web3-provider`, `@web3modal/wagmi`, `multer`, `@types/multer`, `pino-pretty`, `web3`, **`wagmi`**, **`@tanstack/react-query`**. |
| **Data fetching**             | **SWR** is the project standard.                                                                                                                             |
| **Dual icon libraries**       | `@heroicons/react` (primary) + `react-icons` (Web3/portfolio). Consolidate over time to one.                                                                 |

---

## 1. Core framework versions

| Package                             | Installed (resolved) | Latest stable | Status     |
| ----------------------------------- | -------------------- | ------------- | ---------- |
| `next`                              | **16.2.10**          | **16.2.10**   | ✅ Current |
| `react` / `react-dom`               | **19.2.7**           | **19.2.7**    | ✅ Current |
| `eslint-config-next`                | **16.2.10**          | **16.2.10**   | ✅ Current |
| `@types/react` / `@types/react-dom` | **19.2.x**           | **19.2.x**    | ✅ Current |

### Next 16 migration — completed

1. ✅ Renamed `src/middleware.ts` → `src/proxy.ts`
2. ✅ `params` / `searchParams` / `headers()` / `cookies()` awaited
3. ✅ ESLint 9 flat config (`eslint.config.mjs`); `next lint` → `eslint .`
4. ✅ Turbopack default — removed `--turbopack` from `dev` script
5. ⏸ Optional: React Compiler (`reactCompiler: true`) — not enabled
6. ✅ Build verified; auth redirects, contact + Turnstile, Web3 (viem + injected MetaMask), chess autosave paths updated

Node **24.x** (`engines`) already satisfies Next 16’s Node **20.9+** requirement.

---

## 2. Full dependency matrix

### Dependencies — current

| Package                                                  | Current                | Notes                                |
| -------------------------------------------------------- | ---------------------- | ------------------------------------ |
| `@aws-sdk/client-s3` / `s3-request-presigner`            | **3.1088**             | Current line                         |
| `@tinymce/tinymce-react`                                 | **6.3**                | Current                              |
| `immer` / `use-immer`                                    | **11.1.11** / **0.11** | Chess `useMoveTree`                  |
| `react-icons`                                            | 5.x                    | Brand logos; Heroicons is primary UI |
| `react-toastify`                                         | **11.1**               | Project standard                     |
| `swr`                                                    | **2.4.2**              | Client data fetching                 |
| `viem`                                                   | **2.55**               | EtherScan + ETH balance; no wagmi    |
| `chess.js` / `@mliebelt/pgn-parser` / `react-chessboard` | current                | Chess feature                        |
| `@marsidev/react-turnstile`                              | **1.5.3**              | Contact form                         |
| `mailchecker` / `next-themes` / `resend` / `zod`         | current                | Zod v4                               |
| `@heroicons/react`                                       | 2.x                    | Primary icons                        |
| `exif-reader`                                            | 2.x                    | Photo capture dates                  |

### Dependencies — update with care (major / breaking)

| Package                | Current           | Latest                                     | Risk        | Recommendation                                                           |
| ---------------------- | ----------------- | ------------------------------------------ | ----------- | ------------------------------------------------------------------------ |
| `next-auth`            | **5.0.0-beta.31** | beta.**31** (v5); npm `latest` is **4.24** | Medium      | Stay on **Auth.js v5 beta**. Do **not** “upgrade” to v4.                 |
| `mongoose`             | 8.x               | **9.x**                                    | Medium–High | Stay on **8.x** until a dedicated migration.                             |
| `date-fns`             | 3.6               | **4.x**                                    | Medium      | v4 import/path changes — update call sites (`formatDistanceToNow` etc.). |
| `isomorphic-dompurify` | 2.22              | **3.x**                                    | Medium      | Major; re-test diary/blog HTML sanitization.                             |
| `sharp`                | 0.33              | **0.35**                                   | Low–Medium  | Test Next image pipeline / Vercel build.                                 |

### Removed (do not re-add)

| Package                                                    | Why                                                      |
| ---------------------------------------------------------- | -------------------------------------------------------- |
| `wagmi`, `@tanstack/react-query`                           | Web3 is viem + `window.ethereum` (`useInjectedMetaMask`) |
| `web3`, `@walletconnect/web3-provider`, `@web3modal/wagmi` | Unused / deprecated WalletConnect v1                     |
| `multer`, `@types/multer`                                  | App Router uses `request.formData()` + R2                |
| `pino-pretty`                                              | Unused                                                   |

### DevDependencies

| Package                                | Current                | Recommendation                                    |
| -------------------------------------- | ---------------------- | ------------------------------------------------- |
| `typescript`                           | **5.9.3**              | Stay on **TypeScript 5.9**; do not jump to 7 yet. |
| `eslint` / `eslint-config-next`        | **9.39** / **16.2.10** | Current for Next 16                               |
| `tailwindcss` / `@tailwindcss/postcss` | **4.3.3**              | Current                                           |
| `postcss`                              | **8.5**                | Current                                           |
| `@types/node`                          | 24.x                   | Keep **24** while `engines` is `24.x`.            |

---

## 3. Tooling choices — best tools vs legacy

| Concern              | Current                  | Assessment                                                                         |
| -------------------- | ------------------------ | ---------------------------------------------------------------------------------- |
| Client data fetching | SWR                      | **Good.** Project standard.                                                        |
| Auth                 | `next-auth` v5 beta.31   | **Correct line** (Auth.js). Watch for stable `next-auth@5`.                        |
| Validation           | Zod 4                    | **Best choice**                                                                    |
| Email                | Resend                   | **Best choice**                                                                    |
| HTML sanitize        | isomorphic-dompurify     | **Good**; bump carefully                                                           |
| Rich text            | TinyMCE React            | Fine; heavy client bundle — keep client-only                                       |
| Web3 stack           | viem + injected MetaMask | **Done.** No wagmi / WalletConnect / web3.js                                       |
| Icons                | Heroicons + react-icons  | Prefer **Heroicons** for UI chrome; react-icons only for brand logos (`SkillLogo`) |
| CSS                  | Tailwind 4               | **Current / good**                                                                 |
| Notifications        | react-toastify           | Matches project rules — keep                                                       |
| Uploads              | AWS SDK S3 (R2)          | Existing presign / `formData` flow                                                 |

---

## 4. Remaining follow-ups

Priority: **P1** = performance / modern hooks; **P2** = architecture polish.

### P1 — still open

| Target                              | Pattern                       | Replace with                          |
| ----------------------------------- | ----------------------------- | ------------------------------------- |
| Chess `useMoveTree` / `ChessLayout` | Heavy `useCallback`/`useMemo` | Keep until React Compiler; then prune |

### P1 — `useEffectEvent` candidates (after React 19.2)

| File                                        | Why                                | Status                               |
| ------------------------------------------- | ---------------------------------- | ------------------------------------ |
| `src/components/DisplayTime.tsx`            | Interval should not reset          | Optional; `useMounted` is enough     |
| `src/components/WifiStatus.tsx`             | Polling interval                   | Optional                             |
| `src/components/BatteryStatus.tsx`          | Event listener with latest updater | Listeners cleaned up                 |
| `src/app/blog/_components/BlogFilters.tsx`  | Debounced navigation               | **Done** (`useEffectEvent`)          |
| `src/app/chess/_components/ChessLayout.tsx` | Flush/save debounce                | **Done** (`useEffectEvent` + Effect) |

### P2 — Architecture / Next.js structure

| Target                                       | Issue                           | Direction                                                     |
| -------------------------------------------- | ------------------------------- | ------------------------------------------------------------- |
| Many `page.tsx` were empty client re-exports | Extra JS, no RSC benefit        | **Done.** Pages own static chrome; islands are `'use client'` |
| `src/app/diary/[id]/page.tsx`                | Entire detail view client + SWR | Server-fetch diary by id; client island for like/delete       |
| No `"use cache"` / Cache Components          | Optional Next 16                | Cache blog list / portfolio shells                            |
| `next.config.ts`                             | No `reactCompiler`              | Enable post-upgrade if build time OK                          |

---

## 5. Suggested rollout plan (status)

### Phase A — Cleanup — **done**

Removed unused/deprecated packages, replaced `web3` `fromWei` with `viem` `formatEther`, fixed `BatteryStatus` listener leak, removed debug Effects in diaries.

### Phase B — Next.js 16 + React 19.2 — **done**

`proxy.ts`, ESLint 9, Turbopack. React Compiler still optional.

### Phase C — Pattern refactors — **mostly done**

Contact Server Action + `useActionState`, diary likes `useOptimistic`, BlogComments SWR + `useSession`, derived render (DiaryCard, news, wallpapers). Diary create/edit and the blog editor use Server Actions.

### Phase D — Careful majors (separate PRs)

1. `date-fns` 4
2. `isomorphic-dompurify` 3
3. `mongoose` 9

---

## 6. Checklist — “are we on latest stable?”

| Already latest / current enough                                                                                                  | Behind | Blocked / intentional hold                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| **next 16.2.10**, **react 19.2.7**, zod 4, resend, turnstile, chess stack, next-themes, swr, aws-sdk, tailwind 4, viem, eslint 9 | —      | mongoose 9, typescript 7, date-fns 4, isomorphic-dompurify 3, next-auth stay on v5 beta (not v4 “latest”) |

---

## 7. Files touched (refactor queue — status)

```
✅ src/components/BatteryStatus.tsx
✅ src/app/diaries/page.tsx
✅ src/app/blog/[slug]/_components/BlogComments.tsx
✅ src/app/contact/page.tsx + _components/ContactForm.tsx + actions.ts + lib/process-contact.ts
✅ src/app/diary/[id]/page.tsx
✅ src/app/api/blog/[id]/route.ts — PATCH allowlist
✅ src/auth.ts — no sign-in email logs; debug off
✅ src/components/DiaryCard.tsx
✅ src/components/News/FeaturedNews.tsx
✅ src/components/News/NonFeaturedNews.tsx
✅ src/components/Wallpapers.tsx
✅ src/components/Web3/EtherScan.tsx
✅ src/components/Web3/YourMetaMask.tsx
✅ src/app/providers.tsx
✅ src/proxy.ts (was middleware.ts)
✅ package.json — removals + version bumps (no wagmi / TanStack Query)
✅ src/app/diary/[id]/edit/page.tsx — Server Action
✅ Server/client splits — pages own chrome; islands in `_components`
⏸ scripts/cleanup-contacts.mjs — utility script, not part of core audit
```
