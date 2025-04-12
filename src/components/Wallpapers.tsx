'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const Wallpapers = () => {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileWallpaper, setMobileWallpaper] = useState('')
  const [tabletWallpaper, setTabletWallpaper] = useState('')
  const [desktopWallpaper, setDesktopWallpaper] = useState('')

  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update wallpapers based on theme
  useEffect(() => {
    if (!mounted) return

    const currentTheme = theme === 'system' ? resolvedTheme : theme
    const isDark = currentTheme === 'dark'
    const timestamp = Date.now()

    setMobileWallpaper(
      isDark
        ? `/images/bg/iOS-dark.png?v=${timestamp}`
        : `/images/bg/iOS-light.png?v=${timestamp}`
    )

    setTabletWallpaper(
      isDark
        ? `/images/bg/iPadOS-dark.png?v=${timestamp}`
        : `/images/bg/iPadOS-light.png?v=${timestamp}`
    )

    setDesktopWallpaper(
      isDark
        ? `/images/bg/macOS-dark.png?v=${timestamp}`
        : `/images/bg/macOS-light.png?v=${timestamp}`
    )
  }, [theme, resolvedTheme, mounted])

  // Render a placeholder until component is mounted
  if (!mounted) {
    return (
      <div className="absolute block h-full w-full -z-20 bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800" />
    )
  }

  return (
    <div className="absolute block h-full w-full -z-20">
      {/* Mobile Wallpapers */}
      {mounted && mobileWallpaper && (
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
      )}

      {/* Tablet Wallpapers */}
      {mounted && tabletWallpaper && (
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
      )}

      {/* Desktop Wallpapers */}
      {mounted && desktopWallpaper && (
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
      )}
    </div>
  )
}

export default Wallpapers
