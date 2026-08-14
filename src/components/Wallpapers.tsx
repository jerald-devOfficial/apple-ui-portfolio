'use client'

import { useMounted } from '@/hooks/useMounted'
import { useTheme } from 'next-themes'
import Image from 'next/image'

const Wallpapers = () => {
  const { theme, resolvedTheme } = useTheme()
  const mounted = useMounted()

  if (!mounted) {
    return (
      <div className="absolute block h-full w-full -z-20 bg-linear-to-b from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800" />
    )
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme
  const isDark = currentTheme === 'dark'
  const mobileWallpaper = isDark
    ? '/images/bg/iOS-dark.png'
    : '/images/bg/iOS-light.png'
  const tabletWallpaper = isDark
    ? '/images/bg/iPadOS-dark.png'
    : '/images/bg/iPadOS-light.png'
  const desktopWallpaper = isDark
    ? '/images/bg/macOS-dark.png'
    : '/images/bg/macOS-light.png'

  return (
    <div className="absolute block h-full w-full -z-20">
      <Image
        src={mobileWallpaper}
        className="object-cover object-center sm:hidden block"
        sizes="(max-width: 768px) 100vw"
        fill
        priority
        quality={100}
        alt="iOS Wallpaper"
        key={mobileWallpaper}
      />

      <Image
        src={tabletWallpaper}
        className="object-cover object-center hidden sm:block xl:hidden"
        sizes="(min-width: 768px) and (max-width: 1280px) 100vw"
        fill
        priority
        quality={100}
        alt="iPadOS Wallpaper"
        key={tabletWallpaper}
      />

      <Image
        src={desktopWallpaper}
        className="object-cover object-center hidden xl:block"
        fill
        priority
        quality={100}
        sizes="(min-width: 1280px) 100vw"
        alt="macOS Wallpaper"
        key={desktopWallpaper}
      />
    </div>
  )
}

export default Wallpapers
