'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const WifiStatus = () => {
  const [wifiStrength, setWifiStrength] = useState(0)
  const [mounted, setMounted] = useState(false)
  // Using useTheme hook for consistency with other components
  useTheme()

  useEffect(() => {
    setMounted(true)

    // Fetch real-time WiFi signal strength
    const fetchWifiStrength = () => {
      // For demonstration, using a random number between 0 and 100
      const strength = Math.floor(Math.random() * 101)
      setWifiStrength(strength)
    }

    // Fetch WiFi strength initially
    fetchWifiStrength()

    // Fetch WiFi strength every 5 seconds
    const intervalId = setInterval(fetchWifiStrength, 5000)

    // Clear interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  // Don't render anything until after hydration to avoid mismatch
  if (!mounted) return null

  // Dynamic text color based on theme
  const textColorClass = 'text-black dark:text-white'

  return wifiStrength <= 33 ? (
    <svg
      className={textColorClass}
      width="18"
      height="13"
      viewBox="0 0 18 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.7916 10.1177C11.7935 10.2231 11.7565 10.3246 11.6892 10.3984L9.5125 12.8532C9.44869 12.9253 9.3617 12.9659 9.27093 12.9659C9.18016 12.9659 9.09317 12.9253 9.02936 12.8532L6.85233 10.3984C6.78508 10.3246 6.74809 10.223 6.75008 10.1176C6.75207 10.0123 6.79288 9.91248 6.86287 9.84187C8.25297 8.52797 10.2889 8.52797 11.679 9.84187C11.7489 9.91254 11.7897 10.0124 11.7916 10.1177Z"
        fill="currentColor"
      />
    </svg>
  ) : wifiStrength >= 33 && wifiStrength <= 66 ? (
    <svg
      className={textColorClass}
      width="18"
      height="13"
      viewBox="0 0 18 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.26718 7.32419C10.6245 7.32411 11.9334 7.83585 12.9395 8.75998C13.0756 8.89113 13.2899 8.88829 13.4226 8.75357L14.7099 7.43426C14.7777 7.36506 14.8153 7.27118 14.8143 7.17363C14.8133 7.07608 14.7738 6.983 14.7047 6.91521C11.6408 4.02436 6.89611 4.02436 3.83228 6.91521C3.76307 6.983 3.72358 7.07613 3.72267 7.17371C3.72177 7.27129 3.75951 7.36516 3.82745 7.43426L5.11436 8.75357C5.24701 8.88829 5.46137 8.89113 5.59746 8.75998C6.60291 7.83646 7.91075 7.32476 9.26718 7.32419ZM11.7916 10.1177C11.7935 10.2231 11.7565 10.3246 11.6892 10.3984L9.5125 12.8532C9.44869 12.9253 9.3617 12.9659 9.27093 12.9659C9.18016 12.9659 9.09317 12.9253 9.02936 12.8532L6.85233 10.3984C6.78508 10.3246 6.74809 10.223 6.75008 10.1176C6.75207 10.0123 6.79288 9.91254 6.86287 9.84193C8.25297 8.52803 10.2889 8.52803 11.679 9.84193C11.7489 9.9126 11.7897 10.0124 11.7916 10.1177Z"
        fill="currentColor"
      />
    </svg>
  ) : wifiStrength > 66 ? (
    <svg
      className={textColorClass}
      width="18"
      height="13"
      viewBox="0 0 18 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1333_636)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.27052 3.10398C11.7576 3.10408 14.1496 4.02616 15.9521 5.67964C16.0879 5.8073 16.3048 5.80569 16.4385 5.67603L17.736 4.41257C17.8037 4.34681 17.8414 4.25773 17.8409 4.16505C17.8403 4.07237 17.8015 3.98372 17.733 3.91873C13.002 -0.455983 5.53829 -0.455983 0.807275 3.91873C0.738743 3.98368 0.699859 4.07229 0.699227 4.16497C0.698595 4.25766 0.736267 4.34676 0.803908 4.41257L2.10177 5.67603C2.23537 5.80588 2.45249 5.8075 2.58814 5.67964C4.39088 4.02606 6.78317 3.10397 9.27052 3.10398ZM9.26717 7.32425C10.6245 7.32417 11.9334 7.83591 12.9395 8.76004C13.0756 8.89119 13.2899 8.88835 13.4226 8.75363L14.7099 7.43432C14.7777 7.36512 14.8153 7.27124 14.8143 7.17369C14.8133 7.07614 14.7738 6.98306 14.7047 6.91527C11.6408 4.02442 6.8961 4.02442 3.83227 6.91527C3.76306 6.98306 3.72357 7.07619 3.72266 7.17377C3.72176 7.27135 3.7595 7.36522 3.82744 7.43432L5.11435 8.75363C5.247 8.88835 5.46136 8.89119 5.59745 8.76004C6.6029 7.83652 7.91074 7.32482 9.26717 7.32425ZM11.7916 10.1178C11.7935 10.2232 11.7565 10.3247 11.6892 10.3985L9.51249 12.8533C9.44868 12.9254 9.36169 12.966 9.27092 12.966C9.18015 12.966 9.09316 12.9254 9.02935 12.8533L6.85232 10.3985C6.78507 10.3247 6.74808 10.2231 6.75007 10.1177C6.75206 10.0124 6.79287 9.9126 6.86286 9.84199C8.25296 8.52809 10.2889 8.52809 11.679 9.84199C11.7489 9.91266 11.7897 10.0125 11.7916 10.1178Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_1333_636">
          <rect width="18" height="13" fill="currentColor" />
        </clipPath>
      </defs>
    </svg>
  ) : (
    wifiStrength < 1 && null
  )
}

export default WifiStatus
