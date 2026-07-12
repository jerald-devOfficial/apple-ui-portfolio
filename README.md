This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

3. **Setup .env file**
   ```js
    MONGODB=
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    NEXTAUTH_SECRET=
    NEXTAUTH_URL="http://localhost:3000"
    NEXT_PUBLIC_APP_URL="http://localhost:3000"

    NEXT_PUBLIC_NEWS_DATA_API_KEY='this is an api coming from newsdata.io'

    NEXT_PUBLIC_INFURA_ID='https://mainnet.infura.io/v3/api-key'
    NEXT_PUBLIC_METAMASK_ADDRESS='0xGetYourOwnMetaMaskAddress'
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Design Resources

- [Apple Design Resources - macOS](https://www.figma.com/community/file/1251588934545918753/apple-design-resources-macos)
- [Apple Design Resources - iOS 18 and iPadOS 18](https://www.figma.com/community/file/1385659531316001292/ios-18-and-ipados-18)

## App Icon Generation (iOS, iPadOS, macOS)

This portfolio uses custom app icons on the **home screen** (iOS / iPadOS) and **dock** (macOS). Every icon must follow the constraints below so sizing, corner radii, and transparency stay consistent across devices.

### File naming

| Platform | Path | Used in |
|----------|------|---------|
| iOS & iPadOS | `public/images/icons/{name}.png` | Home screen grid (`src/app/page.tsx`) |
| macOS | `public/images/icons/macOS-{name}.png` | Dock (`src/components/layouts/index.tsx`) |

Examples: `chess.png` + `macOS-chess.png`, `resume.png` + `macOS-resume.png`.

### Constraints (required)

Both outputs are **512×512px PNG** with a **transparent background** (RGBA).

#### iOS & iPadOS (`{name}.png`)

| Property | Value |
|----------|-------|
| Canvas | 512×512px |
| Icon body | Full bleed (fills canvas) |
| Corner radius | **120px** |
| Background | Transparent outside the squircle |

#### macOS (`macOS-{name}.png`)

| Property | Value |
|----------|-------|
| Canvas | 512×512px |
| Icon body | **412×412px**, centered |
| Padding | **50px** transparent gap on all sides |
| Corner radius | **96px** (applied to the 412×412 body) |
| Background | Transparent outside the icon |

The macOS icon is intentionally smaller inside the canvas so the dock has breathing room around the squircle, matching Apple’s macOS icon grid.

### Workflow

1. **Create base artwork** — square source image saved as `scripts/{name}-icon-base.png` (1024×1024 recommended). Design the icon edge-to-edge; corners are masked during export.

2. **Generate both platform icons** with `sharp` (already in `package.json`):

   ```bash
   # Generic — pass the app name (matches base file: scripts/<name>-icon-base.png)
   node scripts/generate-icon.mjs <name>

   # Examples
   node scripts/generate-icon.mjs chess
   node scripts/generate-icon.mjs resume
   ```

3. **Register the app** in the UI (if new):
   - Add to `icons` array in `src/app/page.tsx` (home screen)
   - Add to `dockGroup*` in `src/components/layouts/index.tsx` (macOS dock)

### Script architecture

| File | Purpose |
|------|---------|
| `scripts/generate-app-icons.mjs` | Shared library — `ICON_SPECS` + `generateAppIcons()` |
| `scripts/generate-icon.mjs` | CLI entry point — `node scripts/generate-icon.mjs <name>` |
| `scripts/{name}-icon-base.png` | Source artwork (not committed if generated ad-hoc) |

### Adding a new icon (checklist)

- [ ] Create `scripts/{name}-icon-base.png` (1024×1024, squircle-friendly artwork)
- [ ] Run `node scripts/generate-icon.mjs {name}`
- [ ] Verify output: `resume.png` / `macOS-resume.png` specs (512×512, RGBA, correct padding on macOS)
- [ ] Place icons in `public/images/icons/`
- [ ] Register in `page.tsx` and `layouts/index.tsx`
- [ ] Artwork fills frame edge-to-edge — no neon borders, glowing edges, or decorative frames (corners come from export mask only)
- [ ] Apple-style: 3D object on plain/gradient background (no busy textures or tiles)
- [ ] Match the portfolio’s modern icon style (subtle depth, no literal text labels)

See also: `.cursor/rules/icon-create.mdc` for AI-assisted icon creation in Cursor.

## Feature documentation

| Feature | Doc |
|---------|-----|
| Chess repertoire | [`docs/CHESS_FEATURE.md`](docs/CHESS_FEATURE.md) |
| Blog | [`docs/BLOG_FEATURE.md`](docs/BLOG_FEATURE.md) |
