'use client'

import { ThemeToggleIcon } from '@/components/svg-icons'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  // After mounting, we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
    )
  }

  const isDark = theme === 'dark' || resolvedTheme === 'dark'

  return (
    <ThemeToggleIcon
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-5 h-5 cursor-pointer transition-all duration-100 ease-out text-black dark:text-white"
    />
  )
}

export default ThemeToggle
