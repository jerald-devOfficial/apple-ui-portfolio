import { FC } from 'react'

interface ErrorBannerProps {
  message: string
}

const ErrorBanner: FC<ErrorBannerProps> = ({ message }) => {
  if (!message) return null

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md mb-6">
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

export default ErrorBanner
