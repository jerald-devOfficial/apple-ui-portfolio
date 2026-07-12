# Chess Repertoire Feature

## Overview

An opening repertoire app (Chessable / Fritz style) integrated into the Apple UI portfolio shell. Authenticated users can browse, edit, and persist personal opening lines organized by color.

### Core capabilities

- **Repertoire browser**: White / Black sections with collapsible lines (e.g. Italian Game, Sicilian)
- **Interactive board**: `react-chessboard` + `chess.js` move validation
- **PGN notation**: Click any move → board jumps to that position
- **Record moves**: Drag pieces on the board → notation updates and saves
- **Variations**: Add sub-lines at the current node; promote a variation to main line
- **Annotations**: Per-move comments and NAG symbols (`!`, `?`, etc.)
- **Import / export**: Paste PGN to import; download line as `.pgn`
- **Cloud persistence**: Per-user repertoire in MongoDB (auto-seeded on first visit)

### Out of scope (v1)

- Stockfish engine analysis
- Spaced-repetition drills
- Multiplayer / online play
- Keyboard ←/→ navigation
- PGN file upload (paste only)
- Rename section/line UI (API supports it; UI pending)

## Access & registration

| Surface | File | Notes |
|---------|------|-------|
| Route | `/chess` | Auth-gated |
| macOS dock | `src/components/layouts/index.tsx` | Visible when logged in |
| iOS / iPadOS home | `src/app/page.tsx` | Visible when logged in |
| Middleware | `src/middleware.ts` | Cookie-based session check |

Icons: `public/images/icons/chess.png`, `macOS-chess.png`

## Technical implementation

### Stack

- `chess.js` — move validation, FEN
- `react-chessboard` — board UI
- `@mliebelt/pgn-parser` — PGN import
- `use-immer` — immutable tree updates
- `zod` — API payload validation
- SWR — client data fetching

### Model

**`src/models/Repertoire.ts`**

- One document per user (`userId`)
- `sections[]` → `lines[]` → `tree` (nested `IMoveNode`)
- Move node shape: `mainLine` + `variations[]` (not `children` / nested arrays)
- Default seed: 1.e4 / Italian + Sicilian starter lines

### API routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/chess/repertoire` | Fetch repertoire (auto-create if missing) |
| POST | `/api/chess/repertoire` | Create repertoire |
| PATCH | `/api/chess/repertoire` | Actions: `addSection`, `deleteSection`, `addLine`, `deleteLine`, `updateLineTree`, `renameSection`, `renameLine` |
| POST | `/api/chess/repertoire/import` | Merge PGN into a line (400 on invalid PGN) |
| GET | `/api/chess/repertoire/export/[lineId]?sectionId=` | Download `.pgn` |

All routes return **401** without a session.

### App structure

```
src/app/chess/
├── page.tsx
├── _components/   ChessLayout, board, notation, sidebar, modals
├── _hooks/        useRepertoire (SWR), useMoveTree
└── _lib/          pgn-tree, move-tree-utils, board-theme
```

### Responsive layout

| Breakpoint | Layout |
|------------|--------|
| Mobile | Master-detail: repertoire list **or** board + notation |
| Tablet+ | Sidebar + board + notation panel |
| Desktop | Three-column layout |

## Usage

### First visit

1. Sign in with Google
2. Open **Chess** from dock or home screen
3. A default repertoire is created automatically

### Building a line

1. Select a section and line (e.g. White → Italian Game)
2. Play moves on the board — notation updates; saves debounced (~400ms)
3. Click notation moves to navigate the tree
4. Toggle **Add variation** to branch; use **Promote to main line** when on a variation

### Import / export

- **Import**: Header → Import → paste PGN
- **Export**: Header → Export → downloads `.pgn` for the current line

Import **replaces** the line's main line with the imported moves (variations are appended at root). Invalid PGN shows an error toast.

## Environment variables

No chess-specific variables. Uses existing:

- `MONGODB_URI`
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL`

## Icon regeneration

```bash
node scripts/generate-icon.mjs chess
```

See `README.md` (App Icon Generation) and `.cursor/rules/icon-create.mdc`.

## Security

- Middleware redirects unauthenticated users away from `/chess`
- Client-side redirect + API 401 as defense in depth
- Repertoire scoped by session email (`userId`)

## Styling

- Apple UI window shell (frosted header, stone/zinc palette)
- Board squares adapt to light/dark theme
- Montserrat typography (matches Diaries / Mails)
