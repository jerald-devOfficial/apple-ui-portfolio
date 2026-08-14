'use client'

import { useMounted } from '@/hooks/useMounted'
import { addSeconds, format } from 'date-fns'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const DisplayTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const mounted = useMounted()
  useTheme()

  useEffect(() => {
    if (!mounted) return

    const intervalId = setInterval(() => {
      setCurrentTime((prevTime) => addSeconds(prevTime, 1))
    }, 1000)

    return () => clearInterval(intervalId)
  }, [mounted])

  if (!mounted) {
    return <div className="opacity-0 text-xs sm:text-sm">00:00 AM</div>
  }

  const formattedTimeMobile = format(currentTime, 'h:mm a')
  const formattedTimeTablet = format(currentTime, 'h:mm a EEE MMM d')
  const formattedTimeDesktop = format(currentTime, 'EEE MMM d h:mm a')

  return (
    <div className="text-center font-semibold xs:text-sm text-xs gap-x-2 xl:gap-x-4 text-black dark:text-white">
      <div className="hidden sm:block xl:hidden">{formattedTimeTablet}</div>
      <div className="hidden xl:block">{formattedTimeDesktop}</div>
      <div className="sm:hidden xl:hidden">{formattedTimeMobile}</div>
    </div>
  )
}

export default DisplayTime
