/**
 * Generate iOS/iPadOS + macOS icons for a new app.
 *
 * Usage:
 *   node scripts/generate-icon.mjs <name>
 *
 * Example:
 *   node scripts/generate-icon.mjs notes
 *
 * Requires: scripts/<name>-icon-base.png (1024×1024 source artwork)
 * Outputs:  public/images/icons/<name>.png
 *           public/images/icons/macOS-<name>.png
 */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateAppIcons } from './generate-app-icons.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const name = process.argv[2]

if (!name) {
  console.error('Usage: node scripts/generate-icon.mjs <name>')
  console.error('Example: node scripts/generate-icon.mjs notes')
  process.exit(1)
}

const source = join(__dirname, `${name}-icon-base.png`)

try {
  await generateAppIcons({
    source,
    outIos: join(root, `public/images/icons/${name}.png`),
    outMacos: join(root, `public/images/icons/macOS-${name}.png`),
    label: name
  })
} catch (err) {
  console.error(err)
  process.exit(1)
}
