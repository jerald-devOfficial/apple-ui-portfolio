export const NEWS_IMAGE_PLACEHOLDER =
  'https://placehold.co/600x400/000000/FFFFFF.png?text=No+Image'

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|bmp|webp|avif)$/i
const EXCLUDED_HOSTS = /(^|\.)cdn\.openpr\.com$/i

/**
 * newsdata.io returns image URLs from arbitrary publishers, including plain
 * http ones. `next/image` throws at render time for any host outside
 * `remotePatterns` in next.config.ts (https only), and a browser would block
 * an http image on an https page as mixed content regardless.
 */
export const isDisplayableNewsImage = (url: string | null | undefined) => {
  if (!url) return false

  let parsed: URL

  try {
    parsed = new URL(url)
  } catch {
    return false
  }

  if (parsed.protocol !== 'https:') return false
  if (EXCLUDED_HOSTS.test(parsed.hostname)) return false

  return IMAGE_EXTENSIONS.test(parsed.pathname)
}

/** The article image when it is safe to render, the placeholder otherwise. */
export const resolveNewsImage = (url: string | null | undefined) =>
  isDisplayableNewsImage(url) ? (url as string) : NEWS_IMAGE_PLACEHOLDER
