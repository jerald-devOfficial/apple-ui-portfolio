'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const Wallpapers = () => {
  const [mounted, setMounted] = useState(false)
  const [mobileWallpaper, setMobileWallpaper] = useState('')
  const [tabletWallpaper, setTabletWallpaper] = useState('')
  const [desktopWallpaper, setDesktopWallpaper] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)

    // Initial theme check
    const storedTheme = localStorage.getItem('theme')
    setIsDarkMode(storedTheme === 'dark')
    updateWallpapers(storedTheme === 'dark')

    // Setup listener for theme changes
    const checkTheme = () => {
      const theme = localStorage.getItem('theme')
      setIsDarkMode(theme === 'dark')
      updateWallpapers(theme === 'dark')
    }

    // Listen for storage events (cross-tab)
    window.addEventListener('storage', checkTheme)

    // Set up a one-time check for theme changes
    // This polls localStorage every second to check for theme changes
    const interval = setInterval(() => {
      const theme = localStorage.getItem('theme')
      if ((theme === 'dark') !== isDarkMode) {
        setIsDarkMode(theme === 'dark')
        updateWallpapers(theme === 'dark')
      }
    }, 1000)

    return () => {
      window.removeEventListener('storage', checkTheme)
      clearInterval(interval)
    }
  }, [isDarkMode])

  // Function to update wallpapers based on theme
  const updateWallpapers = (isDark: boolean) => {
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
  }

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
