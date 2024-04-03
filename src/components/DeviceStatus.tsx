'use client'

import BatteryStatus from './BatteryStatus'
import WifiStatus from './WifiStatus'

const DeviceStatus = () => {
  return (
    <div className='flex gap-x-2 xl:gap-x-4 items-center'>
      <WifiStatus />
      <BatteryStatus />
    </div>
  )
}

export default DeviceStatus
