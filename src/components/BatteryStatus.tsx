'use client'

import React, { useState, useEffect } from 'react'

interface BatteryManagerEventMap {
  chargingchange: Event
  chargingtimechange: Event
  dischargingtimechange: Event
  levelchange: Event
}

interface BatteryManager extends EventTarget {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
  onchargingchange: ((this: BatteryManager, ev: Event) => any) | null
  onchargingtimechange: ((this: BatteryManager, ev: Event) => any) | null
  ondischargingtimechange: ((this: BatteryManager, ev: Event) => any) | null
  onlevelchange: ((this: BatteryManager, ev: Event) => any) | null
  addEventListener<K extends keyof BatteryManagerEventMap>(
    type: K,
    listener: (this: BatteryManager, ev: BatteryManagerEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void
  removeEventListener<K extends keyof BatteryManagerEventMap>(
    type: K,
    listener: (this: BatteryManager, ev: BatteryManagerEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void
}

const BatteryStatus = () => {
  const [batteryPercentage, setBatteryPercentage] = useState(0)

  useEffect(() => {
    // Check if the Battery Status API is supported
    if ('getBattery' in navigator) {
      ;(navigator as any).getBattery().then((battery: BatteryManager) => {
        // Update battery percentage
        updateBatteryPercentage(battery)

        // Listen for changes in battery level
        battery.addEventListener('levelchange', () => {
          updateBatteryPercentage(battery)
        })
      })
    }
  }, [])

  const updateBatteryPercentage = (battery: BatteryManager) => {
    const percentage = battery.level * 100
    setBatteryPercentage(percentage)
  }

  return (
    <div className='flex items-center gap-x-1.5'>
      <span className='outline-2 outline outline-white/50 xl:outline-black/50 outline-offset-2 rounded-sm h-2 w-5 relative'>
        {/* Percentage white bar */}
        <span
          className='w-full h-full bg-white xl:bg-black absolute rounded-sm'
          style={{ width: `${batteryPercentage}%` }}
        />
      </span>
      <span className='rounded-r-full h-1 w-0.5 bg-white/50 xl:bg-black/50' />
    </div>
  )
}

export default BatteryStatus
