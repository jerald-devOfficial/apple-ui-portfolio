# AGENTS.md

## Cursor Cloud specific instructions

### Overview
This is an Apple-inspired personal portfolio and blog website built with **Next.js 15** (App Router, Turbopack), **React 19**, **TypeScript**, **Tailwind CSS v4**, and **MongoDB** (via Mongoose). It uses **Yarn 4.5.3** (Berry) as the package manager with `nodeLinker: node-modules`.

### Services
| Service | Required | How to start |
|---|---|---|
| MongoDB | Yes | `mongod --dbpath /data/db --bind_ip 127.0.0.1 --port 27017` (runs on port 27017) |
| Next.js dev server | Yes | `yarn dev` (runs on port 4000 with Turbopack) |

### Environment variables
Copy `.env.example` to `.env` and fill in values. The app uses `MONGODB_URI` in code (not `MONGODB` as the example might suggest). Key required vars: `MONGODB_URI`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`.

### Standard commands
See `package.json` scripts:
- **Dev**: `yarn dev` (port 4000, Turbopack)
- **Lint**: `yarn lint`
- **Build**: `yarn build`

### Gotchas
- The `.env.example` uses the variable name `MONGODB` but the code (`src/utils/db.ts`) reads `MONGODB_URI`. Use `MONGODB_URI` in your `.env`.
- MongoDB must be running before starting the dev server; otherwise API routes that touch the DB will fail.
- Google OAuth credentials are needed for login flows. Without them, the app still renders all public pages (home, blog, contact, portfolio, news, web3) but login and authenticated features (diary, mail, admin) will not work.
- The app connects to MongoDB on first API request, not on server startup. Public pages will load fine even if MongoDB is temporarily unavailable.
