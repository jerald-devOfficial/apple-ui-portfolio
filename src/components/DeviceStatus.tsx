'use client'

import { useEffect, useState } from 'react'
import BatteryStatus from './BatteryStatus'
import WifiStatus from './WifiStatus'

const DeviceStatus = () => {
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
    <div
      className={`flex gap-x-2 xl:gap-x-4 items-center ${
        isDarkMode ? 'text-white' : 'text-black dark:text-white'
      }`}
    >
      <WifiStatus />
      <BatteryStatus />
    </div>
  )
}

export default DeviceStatus
