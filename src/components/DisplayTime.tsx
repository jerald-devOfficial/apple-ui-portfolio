'use client'

import { useState, useEffect } from 'react'
import { format, addSeconds } from 'date-fns'

const DisplayTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime((prevTime) => addSeconds(prevTime, 1))
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    setHydrated(true)
  }, [])
  if (!hydrated) {
    return <div />
  }

  const formattedTimeMobile = format(currentTime, 'h:mm a')
  const formattedTimeTablet = format(currentTime, 'h:mm a EEE MMM d')
  const formattedTimeDesktop = format(currentTime, 'EEE MMM d h:mm a')

  return (
    <div className='text-center font-medium text-white xl:text-black xs:text-sm text-xs gap-x-2 xl:gap-x-4'>
      <div className='hidden sm:block xl:hidden'>{formattedTimeTablet}</div>
      <div className='hidden xl:block'>{formattedTimeDesktop}</div>
      <div className='sm:hidden xl:hidden'>{formattedTimeMobile}</div>
    </div>
  )
}

export default DisplayTime
