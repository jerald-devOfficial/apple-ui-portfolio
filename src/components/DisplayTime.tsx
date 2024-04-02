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
  }, []) // Ensure empty dependency array to run effect only once

  const formattedTimeMobile = format(currentTime, 'h:mm a')
  const formattedTimeTablet = format(currentTime, 'h:mm a EEE MMM d')
  const formattedTimeDesktop = format(currentTime, 'EEE MMM d h:mm a')

  useEffect(() => {
    // This forces a rerender, so the date is rendered
    // the second time but not the first
    setHydrated(true)
  }, [])
  if (!hydrated) {
    // Returns null on first render, so the client and server match
    return (
      <div className='text-center font-medium text-white xl:text-black text-base gap-x-2 xl:gap-x-4'>
        <div className='hidden sm:block xl:hidden'>{formattedTimeTablet}</div>
        <div className='hidden xl:block'>{formattedTimeDesktop}</div>
        <div className='sm:hidden lg:hidden'>{formattedTimeMobile}</div>
      </div>
    )
  }

  return (
    <div className='text-center font-medium text-white xl:text-black text-base gap-x-2 xl:gap-x-4'>
      <div className='hidden sm:block xl:hidden'>{formattedTimeTablet}</div>
      <div className='hidden xl:block'>{formattedTimeDesktop}</div>
      <div className='sm:hidden lg:hidden'>{formattedTimeMobile}</div>
    </div>
  )
}

export default DisplayTime
