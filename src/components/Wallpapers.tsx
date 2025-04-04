'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const Wallpapers = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Detect system color scheme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check initial preference
      const darkModeMediaQuery = window.matchMedia(
        '(prefers-color-scheme: dark)'
      )
      setIsDarkMode(darkModeMediaQuery.matches)

      // Listen for changes in system preference
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches)
      }

      darkModeMediaQuery.addEventListener('change', handleChange)
      return () =>
        darkModeMediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return (
    <div className="absolute block h-full w-full -z-20">
      {/* Mobile Wallpapers */}
      <Image
        src={
          isDarkMode ? '/images/bg/iOS-dark.png' : '/images/bg/iOS-light.png'
        }
        className="object-cover object-center sm:hidden block"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
        fill
        priority
        alt="iOS Wallpaper"
      />

      {/* Tablet Wallpapers */}
      <Image
        src={
          isDarkMode
            ? '/images/bg/iPadOS-dark.png'
            : '/images/bg/iPadOS-light.png'
        }
        className="object-cover object-center hidden sm:block xl:hidden"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
        fill
        priority
        alt="iPadOS Wallpaper"
      />

      {/* Desktop Wallpapers */}
      <Image
        src={
          isDarkMode
            ? '/images/bg/macOS-dark.png'
            : '/images/bg/macOS-light.png'
        }
        className="object-cover object-center hidden xl:block"
        fill
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
        alt="macOS Wallpaper"
      />
    </div>
  )
}

export default Wallpapers
