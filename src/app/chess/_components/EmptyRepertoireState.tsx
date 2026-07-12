'use client'

import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

type EmptyRepertoireStateProps = {
  variant?: 'loading' | 'error'
  message?: string
  onRetry?: () => void
}

const EmptyRepertoireState = ({
  variant = 'loading',
  message,
  onRetry
}: EmptyRepertoireStateProps) => {
  if (variant === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 text-center">
        <ExclamationTriangleIcon className="h-10 w-10 text-amber-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Could not load repertoire
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          {message ??
            'Something went wrong while fetching your opening lines. Please try again.'}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 text-center">
      <div className="text-4xl animate-pulse">♟</div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Loading your repertoire…
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
        Your opening lines for White and Black will appear here.
      </p>
    </div>
  )
}

export default EmptyRepertoireState
