'use client'

import { useMounted } from '@/hooks/useMounted'
import { useTheme } from 'next-themes'
import BatteryStatus from './BatteryStatus'
import WifiStatus from './WifiStatus'

const DeviceStatus = () => {
  const mounted = useMounted()
  useTheme()

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
