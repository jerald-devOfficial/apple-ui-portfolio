'use client'

import { ThemeToggleIcon } from '@/components/svg-icons'
import { useTheme } from 'next-themes'

const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme()

  return (
    <ThemeToggleIcon
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
      className="w-5 h-5 cursor-pointer transition-all duration-100 ease-out text-black dark:text-white"
    />
  )
}

export default ThemeToggle
