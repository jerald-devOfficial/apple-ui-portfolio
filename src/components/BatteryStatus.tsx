'use client'

import { useMounted } from '@/hooks/useMounted'
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
  const mounted = useMounted()
  const isIOS = mounted && /iPad|iPhone|iPod/.test(navigator.userAgent)
  useTheme()

  useEffect(() => {
    if (!mounted || isIOS) return

    let battery: BatteryManager | null = null
    let cancelled = false

    const updateBatteryPercentage = (manager: BatteryManager) => {
      setBatteryPercentage(manager.level * 100)
    }

    const onLevelChange = () => {
      if (battery) updateBatteryPercentage(battery)
    }

    if ('getBattery' in navigator) {
      ;(navigator as NavigatorWithBattery)
        .getBattery()
        .then((manager: BatteryManager) => {
          if (cancelled) return
          battery = manager
          updateBatteryPercentage(manager)
          manager.addEventListener('levelchange', onLevelChange)
        })
    }

    return () => {
      cancelled = true
      battery?.removeEventListener('levelchange', onLevelChange)
    }
  }, [mounted, isIOS])

  if (!mounted) return null

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
