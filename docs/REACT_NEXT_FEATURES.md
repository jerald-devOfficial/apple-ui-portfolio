# React 19 & Next.js 16 — Features vs this codebase

Curated reference **and adoption audit** for this app (**Next.js 16.2.10** + **React 19.2.7**, scanned 2026-08-14).

For package versions and remaining majors, see [PACKAGE_AND_CODE_AUDIT.md](./PACKAGE_AND_CODE_AUDIT.md).

---

## Table of contents

1. [Adoption scorecard](#1-adoption-scorecard)
2. [React 19 hooks & concepts](#2-react-19-hooks--concepts)
3. [React 19.2 additions](#3-react-192-additions)
4. [Next.js 16 features](#4-nextjs-16-features)
5. [Replacement cheat sheet](#5-replacement-cheat-sheet)
6. [What to do next](#6-what-to-do-next)

---

## 1. Adoption scorecard

| Feature                                       | Used?   | Correct? | Where                                                                                                        |
| --------------------------------------------- | ------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `useActionState` + Server Action              | **Yes** | **Yes**  | Contact, diary create/edit, blog editor                                                                      |
| `useFormStatus`                               | **Yes** | **Yes**  | Contact submit + fieldset; diary save; blog save                                                             |
| `useOptimistic`                               | **Yes** | **Yes**  | Diary like, blog comment like, mails read/unread/delete                                                      |
| Async `useTransition`                         | **Yes** | **Yes**  | Likes, comments, mails                                                                                       |
| `use()` (Promise unwrap)                      | **No**  | —        | Blog/diary detail are Server Components; client lists use SWR. Do not replace SWR with `use()`.              |
| `useEffectEvent`                              | **Yes** | **Yes**  | `BlogFilters` debounce; chess save flush                                                                     |
| `useSyncExternalStore` (`useMounted`)         | **Yes** | **Yes**  | Hydration-safe mount flag; no `setState` in an effect                                                        |
| Adjust state during render                    | **Yes** | **Yes**  | `ChessLayout` derives selected section/line/orientation                                                      |
| `ref` as a prop (no `forwardRef`)             | **Yes** | **Yes**  | No `forwardRef` in `src/`                                                                                    |
| React Compiler                                | **No**  | —        | `reactCompiler` not set in `next.config.ts`                                                                  |
| `<Activity>` / View Transitions               | **No**  | —        | Optional; Web3 tabs and diary navigation do not use them                                                     |
| `"use cache"` / `cacheTag`                    | **No**  | —        | Optional; blog list still queries Mongo per request                                                          |
| Async `params` / `searchParams` / `headers()` | **Yes** | **Yes**  | Blog + diary pages, API routes, contact action                                                               |
| `proxy.ts` (was middleware)                   | **Yes** | **Yes**  | Auth redirects for `/mails`, diary create/edit, `/chess`, `/contact`                                         |
| ESLint 9 flat config                          | **Yes** | **Yes**  | `eslint.config.mjs`; script is `eslint .`                                                                    |
| Turbopack default                             | **Yes** | **Yes**  | `next dev` has no `--turbopack` flag                                                                         |
| Server Components by default                  | **Yes** | **Yes**  | Pages own static chrome (`<main>`, headings, layout). `'use client'` only on islands that need state/events. |

**Verdict:** The stack is on current Next 16 / React 19, and the hooks that matter for this app are in place: Server Actions + `useActionState` / `useFormStatus`, `useOptimistic` inside `startTransition`, `useEffectEvent` for chess flush and blog filters, and server pages with static chrome plus client islands. Remaining optionals are React Compiler, `"use cache"`, `<Activity>`, and View Transitions.

---

## 2. React 19 hooks & concepts

### `use()` — read a Promise or Context during render

|                |                                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| **What**       | Unwraps a Promise (suspends) or reads Context. Can be called conditionally.                                |
| **Use when**   | A parent Server Component already started a fetch; a client child needs the resolved value under Suspense. |
| **Instead of** | `useEffect` + `useState` to store fetched data.                                                            |
| **Avoid**      | Creating a new Promise inside render.                                                                      |

**Status:** Not used. That is the right call here. Project rules say **SWR** for client fetching. Blog list/detail already `await` Mongo in Server Components and pass props into client islands (`BlogFilters`, `BlogComments`). Introducing `use(commentsPromise)` would duplicate SWR without a clear win.

---

### `useActionState` — form / action result + pending

|                |                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------- |
| **What**       | Wraps an async Action; returns `[state, formAction, isPending]`. Replaces `useFormState`. |
| **Use when**   | Forms that return success/error state.                                                    |
| **Instead of** | `isSubmitting` / `error` / `success` + `preventDefault` + manual `fetch`.                 |

**Status: implemented correctly** on contact, diary create/edit, and the blog editor.

- Contact: `'use server'` in `src/app/contact/actions.ts`; toasts from action state.
- Diary: `src/app/diary/actions.ts` (`createDiaryAction`, `updateDiaryAction`, `deleteDiaryAction`); TinyMCE content is a hidden field; `redirect()` on success.
- Blog: `src/app/blog/actions.ts` (`saveBlogAction`); content blocks JSON in a hidden field.

Comment _submit_ in `BlogComments.tsx` still uses `fetch` inside `startTransition` (likes already use `useOptimistic`).

---

### `useFormStatus` — pending state inside form children

|                |                                                                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **What**       | Child of a `<form>` reads `{ pending }` from the nearest form. Must **not** be called in the same component that renders `<form>`. |
| **Instead of** | Passing `isPending` down.                                                                                                          |

**Status: used correctly.** `ContactSubmitButton` and `ContactFields` call `useFormStatus` as form children. Diary and blog save buttons do the same.

---

### `useOptimistic` — instant UI, auto-revert on failure

|          |                                                                                                     |
| -------- | --------------------------------------------------------------------------------------------------- |
| **What** | Predicted UI while an async update runs; React reverts if the transition fails or state catches up. |
| **Rule** | Call the optimistic setter **inside** `startTransition` (or an Action).                             |

**Status: implemented correctly.**

Diary like (`src/app/diary/[id]/_components/DiaryViewActions.tsx`) and blog comment likes wrap the optimistic update in `startTransition`. Mails (`src/app/mails/_components/Mails.tsx`) optimistic-updates read / unread / delete, then `mutate()`.

---

### Actions + async `useTransition`

**Status: used correctly** for diary likes and blog comments. Chess repertoire saves use `useEffectEvent` + an Effect-driven debounce (`saveRequest`), not transitions.

---

### `ref` as a prop (no `forwardRef`)

**Status: done.** No `forwardRef` in `src/`. Turnstile uses a normal `ref` on `ContactForm`.

---

### React Compiler (stable with Next.js 16)

```ts
const nextConfig = {
  reactCompiler: true // not enabled
}
```

**Status: not enabled.** Chess (`useMoveTree`, `ChessLayout`) still has a lot of manual `useCallback` / `useMemo`. Keep those until the compiler is on; they are semantic (stable callbacks for board drops / save flush), not cargo-cult.

---

### Document metadata

**Status: done** via Next `metadata` in `src/app/layout.tsx` (`suppressHydrationWarning` on `<html>`). No React 19 manual `<title>` hoisting needed.

---

## 3. React 19.2 additions

### `useEffectEvent` — non-reactive logic inside Effects

|                |                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| **What**       | Event-like logic that always sees latest props/state **without** re-subscribing.                             |
| **Instead of** | Refs for latest callbacks; omitting Effect deps; putting changing values in deps and tearing down intervals. |

**Status: used correctly** in `BlogFilters` (debounced `router.push`) and `ChessLayout` (`flushPendingSave` from unmount, line-change, and debounce Effects). Clock / wifi / battery effects do not need it.

---

### Adjusting state during render (not an Effect)

React 19 documents storing previous props/state and calling `setState` during render when derived UI must catch up.

**Status: implemented correctly in `ChessLayout`.** Selected section/line and board orientation update during render when `activeColor` / repertoire data change. This replaced a props→state Effect and satisfies `react-hooks/set-state-in-effect`.

---

### `useMounted` via `useSyncExternalStore`

```ts
export const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
```

**Status: correct.** Used by Wallpapers, DeviceStatus, DisplayTime, BatteryStatus, WifiStatus, TinyMCEEditor. No `useState` + `useEffect(() => setMounted(true))`.

Wallpapers / news images / DiaryCard previews **derive during render** (no props→state Effects). `MoveAnnotationEditor` remounts with `key={currentNode?.san ?? path}`. `DiaryForm` receives a server-fetched `diary` on edit. `BlogEditor` initializes from server-passed `blog` props.

---

### `<Activity>` (React 19.2)

Keeps a subtree mounted but hidden. **Not used.** Web3 still toggles panels with local tab state (unmount/remount). Optional later for MetaMask / EtherScan.

---

### View Transitions (React 19.2 / Next 16)

**Not used.** Optional for diaries → diary detail.

---

## 4. Next.js 16 features

### Turbopack (default)

**Done.** `package.json` script is `next dev -p 4000` (no `--turbopack`). No custom webpack config.

### Cache Components + `"use cache"`

**Not used.** Blog pages query Mongo on every request. Fine for a small admin-authored blog; tag-based cache would help if traffic grows.

### Async Request APIs (required)

**Done everywhere that matters.**

- `await params` / `await searchParams` on blog and diary pages and all dynamic API routes (`diary`, `blog`, `photos`, `contact`, chess export).
- `await headers()` in the contact Server Action.
- No leftover sync `params: { id: string }` page/route signatures in `src/`.

### `middleware.ts` → `proxy.ts`

**Done.** `src/proxy.ts` exports `proxy` + `config.matcher`. Protects `/mails`, `/admin`, `/diary` create + `/diary/[id]/edit`, `/chess`; redirects admins from `/contact` to `/mails`. Public diary detail is not gated (the page handles private entries). Duplicate client `useEffect` redirects on diary/chess/mails are gone.

### Server page chrome (not empty wrappers)

A Server Component `page.tsx` must render static JSX that does not need state or event handlers: `<main>`, headings, panel chrome, auth-gated links from `auth()`. Interactive pieces live in `_components` as `'use client'` islands.

An empty page that only does `return <ClientTree />` is not a split — it duplicates the tree with no server payload. Home, diaries, diary, news, and blog pages keep real chrome; chess / mails / web3 / portfolio keep at least the `<main>` landmark and font wrapper.

### Caching APIs (`cacheLife` / `cacheTag` / `updateTag`)

**Not used.** Contact / diary / blog mutations do not revalidate tags (they are mostly client-SWR or full navigations).

### React Compiler config

**Not enabled.**

### ESLint / `next lint`

**Done.** `eslint@9` + `eslint-config-next@16` flat config. Lint script: `eslint .`.

### Node.js

`engines.node: 24.x` satisfies Next 16’s Node 20.9+ requirement.

### Routing / prefetch

Layout dedup / incremental prefetch are framework-level; no app code required.

---

## 5. Replacement cheat sheet

| Outdated / heavy pattern           | Prefer                                          | This app                                                                                                                          |
| ---------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `useEffect` + `fetch` + `useState` | SWR **or** Server Component                     | **SWR** on diaries, mails, news, photos, chess. Diary **detail/edit** are server-fetched. EtherScan fetch is on submit.           |
| `useEffect` syncing props → state  | Derive during render, or `key={id}`             | **Done** for DiaryCard, news images, wallpapers, TinyMCE theme, MoveAnnotationEditor.                                             |
| `useEffect` for auth redirect only | `proxy.ts` + server `auth()`                    | **Done.** Proxy is the gate; client redirects removed.                                                                            |
| Manual `isSubmitting` on forms     | `useActionState` + `useFormStatus`              | **Contact, diary, blog editor.**                                                                                                  |
| Optimistic UI by hand              | `useOptimistic`                                 | **Diary likes, comment likes, mails.**                                                                                            |
| `useCallback` everywhere           | React Compiler / only when needed               | Chess still needs stable callbacks until Compiler.                                                                                |
| `forwardRef`                       | `ref` prop                                      | **None left.**                                                                                                                    |
| `useFormState`                     | `useActionState`                                | **`useActionState` on contact, diary, blog.**                                                                                     |
| Sync `params` / `searchParams`     | `await params`                                  | **Done.**                                                                                                                         |
| `middleware.ts`                    | `proxy.ts`                                      | **Done.**                                                                                                                         |
| Client page for static shell       | Server Component chrome + `_components` islands | **Done.** Pages render `<main>` / headings / panel chrome. Do **not** use an empty `page.tsx` that only re-exports a client tree. |
| `mounted` + `useEffect`            | `useSyncExternalStore`                          | **`useMounted` done.**                                                                                                            |
| Wagmi / React Query / web3.js      | viem + injected provider                        | **Done.** `useInjectedMetaMask` + SWR balances. Connect is explicit, not auto-prompt.                                             |

---

## 6. What to do next

Optional later (not required for the 19/16 programming model):

1. React Compiler (`reactCompiler: true`)
2. `"use cache"` / `cacheTag` on the blog list
3. `<Activity>` for Web3 tabs
4. View Transitions on diary navigation
5. Blog comment _submit_ as a Server Action (likes already optimistic)

Do **not** adopt `use()` as a second data library next to SWR. Do **not** re-add wagmi or TanStack Query.
