'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface BatteryManagerEventMap {
  chargingchange: Event
  chargingtimechange: Event
  dischargingtimechange: Event
  levelchange: Event
}

interface NavigatorWithBattery extends Navigator {
  getBattery: () => Promise<BatteryManager>
}

interface BatteryManager extends EventTarget {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
  onchargingchange: ((this: BatteryManager, ev: Event) => void) | null
  onchargingtimechange: ((this: BatteryManager, ev: Event) => void) | null
  ondischargingtimechange: ((this: BatteryManager, ev: Event) => void) | null
  onlevelchange: ((this: BatteryManager, ev: Event) => void) | null
  addEventListener<K extends keyof BatteryManagerEventMap>(
    type: K,
    listener: (this: BatteryManager, ev: BatteryManagerEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void
  removeEventListener<K extends keyof BatteryManagerEventMap>(
    type: K,
    listener: (this: BatteryManager, ev: BatteryManagerEventMap[K]) => void,
    options?: boolean | EventListenerOptions
  ): void
}

const BatteryStatus = () => {
  const [batteryPercentage, setBatteryPercentage] = useState(0)
  const [isIOS, setIsIOS] = useState(false)
  const [mounted, setMounted] = useState(false)
  // Using useTheme hook for consistency with other components
  useTheme()

  useEffect(() => {
    setMounted(true)

    // Check if the Battery Status API is supported
    if ('getBattery' in navigator) {
      ;(navigator as NavigatorWithBattery)
        .getBattery()
        .then((battery: BatteryManager) => {
          // Update battery percentage
          updateBatteryPercentage(battery)

          // Listen for changes in battery level
          battery.addEventListener('levelchange', () => {
            updateBatteryPercentage(battery)
          })
        })
    } else if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      // Check if the user agent indicates iOS
      setIsIOS(true)
    }
  }, [])

  const updateBatteryPercentage = (battery: BatteryManager) => {
    const percentage = battery.level * 100
    setBatteryPercentage(percentage)
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) return null

  // Dynamic styling based on theme
  const outlineColorClass = 'outline-black/50 dark:outline-white/50'
  const fillClass = 'bg-black dark:bg-white'
  const tipClass = 'bg-black/50 dark:bg-white/50'

  return (
    <div className="flex items-center gap-x-1.5">
      {isIOS ? (
        <>
          <span
            className={`outline-2 ${outlineColorClass} outline-offset-2 rounded-xs h-2 w-5 relative`}
          >
            {/* Percentage bar */}
            <span
              className={`w-full h-full ${fillClass} absolute rounded-xs flex items-center justify-center`}
              style={{ width: `100%` }}
            >
              <XMarkIcon className="text-red-600 h-3 w-3" />
            </span>
          </span>
          <span className={`rounded-r-full h-1 w-0.5 ${tipClass}`} />
        </>
      ) : (
        <>
          <span
            className={`outline-2 ${outlineColorClass} outline-offset-2 rounded-xs h-2 w-5 relative`}
          >
            {/* Percentage bar */}
            <span
              className={`w-full h-full ${fillClass} absolute rounded-xs`}
              style={{ width: `${batteryPercentage}%` }}
            />
          </span>
          <span className={`rounded-r-full h-1 w-0.5 ${tipClass}`} />
        </>
      )}
    </div>
  )
}

export default BatteryStatus
