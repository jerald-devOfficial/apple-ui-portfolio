'use client'

import { addSeconds, format } from 'date-fns'
import { useEffect, useState } from 'react'

const DisplayTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [hydrated, setHydrated] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Update time every second
    const intervalId = setInterval(() => {
      setCurrentTime((prevTime) => addSeconds(prevTime, 1))
    }, 1000)

    // Handle dark mode detection
    if (typeof window !== 'undefined') {
      const darkModeMediaQuery = window.matchMedia(
        '(prefers-color-scheme: dark)'
      )
      setIsDarkMode(darkModeMediaQuery.matches)

      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches)
      }

      darkModeMediaQuery.addEventListener('change', handleChange)
      return () => {
        clearInterval(intervalId)
        darkModeMediaQuery.removeEventListener('change', handleChange)
      }
    }

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
    <div
      className={`text-center font-medium xs:text-sm text-xs gap-x-2 xl:gap-x-4
      ${isDarkMode ? 'text-white' : 'text-black dark:text-white'}`}
    >
      <div className="hidden sm:block xl:hidden">{formattedTimeTablet}</div>
      <div className="hidden xl:block">{formattedTimeDesktop}</div>
      <div className="sm:hidden xl:hidden">{formattedTimeMobile}</div>
    </div>
  )
}

export default DisplayTime
