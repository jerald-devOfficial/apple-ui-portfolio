import sharp from 'sharp'
import { basename } from 'node:path'

/**
 * Portfolio app icon constraints (iOS / iPadOS / macOS).
 *
 * iOS & iPadOS  → public/images/icons/{name}.png
 * macOS         → public/images/icons/macOS-{name}.png
 */
export const ICON_SPECS = {
  canvas: 512,
  ios: { size: 512, cornerRadius: 120 },
  macos: { iconSize: 412, cornerRadius: 96, padding: 50 }
}

const roundedMask = (width, height, radius) =>
  Buffer.from(
    `<svg width="${width}" height="${height}">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="white"/>
    </svg>`
  )

const applyRoundedIcon = async (source, size, radius) => {
  const mask = roundedMask(size, size, radius)
  return sharp(source)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .ensureAlpha()
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer()
}

export const generateAppIcons = async ({
  source,
  outIos,
  outMacos,
  label = 'icon'
}) => {
  const { ios, macos, canvas } = ICON_SPECS

  const iosIcon = await applyRoundedIcon(source, ios.size, ios.cornerRadius)
  await sharp(iosIcon).toFile(outIos)

  const macIcon = await applyRoundedIcon(
    source,
    macos.iconSize,
    macos.cornerRadius
  )
  await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: macIcon, left: macos.padding, top: macos.padding }])
    .png()
    .toFile(outMacos)

  const [iosMeta, macMeta] = await Promise.all([
    sharp(outIos).metadata(),
    sharp(outMacos).metadata()
  ])

  console.log(`Generated ${label} icons:`)
  console.log(
    `  ${basename(outIos)}       → ${iosMeta.width}×${iosMeta.height}px, RGBA, ${ios.cornerRadius}px radius`
  )
  console.log(
    `  ${basename(outMacos)} → ${macMeta.width}×${macMeta.height}px canvas, ${macos.iconSize}×${macos.iconSize} @ (${macos.padding},${macos.padding}), ${macos.cornerRadius}px radius`
  )
}
