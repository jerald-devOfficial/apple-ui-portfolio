import { BookOpenIcon, PlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FC } from 'react'

interface EmptyDiaryStateProps {
  isAuthenticated: boolean
}

const EmptyDiaryState: FC<EmptyDiaryStateProps> = ({ isAuthenticated }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-sm">
      <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
        <BookOpenIcon className="h-8 w-8 text-blue-500 dark:text-blue-400" />
      </div>

      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
        No diary entries yet
      </h3>

      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
        {isAuthenticated
          ? 'Start capturing your thoughts, ideas, and experiences by creating your first diary entry.'
          : 'Sign in to create and view your personal diary entries.'}
      </p>

      {isAuthenticated ? (
        <Link href="/diary">
          <button className="bg-blue-500 hover:bg-blue-600 transition-colors text-white rounded-full px-5 py-2 flex items-center space-x-2 shadow-sm">
            <PlusIcon className="h-5 w-5" />
            <span>Create your first entry</span>
          </button>
        </Link>
      ) : (
        <Link href="/signin">
          <button className="bg-blue-500 hover:bg-blue-600 transition-colors text-white rounded-full px-5 py-2 flex items-center space-x-2 shadow-sm">
            <span>Sign in</span>
          </button>
        </Link>
      )}
    </div>
  )
}

export default EmptyDiaryState
