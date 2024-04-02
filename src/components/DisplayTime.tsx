'use client'

import { useState, useEffect } from 'react'
import { format, addSeconds } from 'date-fns'

const DisplayTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime((prevTime) => addSeconds(prevTime, 1))
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  const formattedTimeMobile = format(currentTime, 'h:mm a')
  const formattedTimeTablet = format(currentTime, 'h:mm a EEE MMM d')
  const formattedTimeDesktop = format(currentTime, 'EEE MMM d h:mm a')

  return (
    <div className='text-center font-medium text-white lg:text-black text-base gap-x-2 lg:gap-x-4'>
      <div className='hidden sm:block lg:hidden'>{formattedTimeTablet}</div>
      <div className='hidden lg:block'>{formattedTimeDesktop}</div>
      <div className='sm:hidden lg:hidden'>{formattedTimeMobile}</div>
    </div>
  )
}

export default DisplayTime
