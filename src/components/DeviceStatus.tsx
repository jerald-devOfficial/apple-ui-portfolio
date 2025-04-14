'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import BatteryStatus from './BatteryStatus'
import WifiStatus from './WifiStatus'

const DeviceStatus = () => {
  const [mounted, setMounted] = useState(false)
  // Using useTheme hook for consistency with other components
  useTheme()

  // Wait for hydration to complete
  useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR and before hydration, return a simple div to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex gap-x-2 xl:gap-x-4 items-center opacity-0">
        <div className="h-3 w-3" />
        <div className="h-3 w-3" />
      </div>
    )
  }

  return (
    <div className="flex gap-x-2 xl:gap-x-4 items-center text-black dark:text-white">
      <WifiStatus />
      <BatteryStatus />
    </div>
  )
}

export default DeviceStatus
