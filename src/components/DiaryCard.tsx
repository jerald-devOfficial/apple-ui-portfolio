import { IDiary } from '@/models/Diary'
import {
  ArrowRightIcon,
  CalendarIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'

interface DiaryCardProps {
  diary: IDiary
  isOwner?: boolean
  onDelete?: (id: string) => void
}

const DiaryCard: FC<DiaryCardProps> = ({
  diary,
  isOwner = false,
  onDelete
}) => {
  const [contentPreview, setContentPreview] = useState<string>('')

  // Handle delete click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onDelete) {
      onDelete(diary._id)
    }
  }

  // Format date consistently
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recent'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return 'Recent'
    }
  }

  useEffect(() => {
    // Parse HTML content to extract plain text for preview
    const getContentPreview = (htmlContent: string) => {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlContent

      // Clean up TinyMCE specific elements for code blocks
      const codeBlocks = tempDiv.querySelectorAll('pre, code')
      codeBlocks.forEach((block) => {
        block.textContent = '[code block]'
      })

      // Get plain text and limit to appropriate length
      const text = tempDiv.textContent || tempDiv.innerText || ''
      const maxLength = 120
      return text.length > maxLength
        ? `${text.substring(0, maxLength).trim()}...`
        : text
    }

    setContentPreview(getContentPreview(diary.content))
  }, [diary.content])

  return (
    <div className="h-full">
      <div className="group rounded-xl overflow-hidden bg-white dark:bg-zinc-800 shadow-sm border border-gray-200 dark:border-zinc-700 hover:shadow-md transition duration-300 h-full flex flex-col">
        <div className="p-5 flex flex-col h-full">
          {/* Header with title and action buttons */}
          <div className="flex justify-between items-start mb-2">
            <Link href={`/diary/${diary._id}`} className="flex-grow min-w-0">
              <h3 className="font-medium text-lg text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors truncate">
                {diary.title}
                {isOwner && (
                  <span
                    className="ml-2 inline-flex items-center"
                    title="Your diary"
                  >
                    <UserIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  </span>
                )}
              </h3>
            </Link>

            {/* Action buttons for owner */}
            {isOwner && (
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <Link
                  href={`/diary/${diary._id}/edit`}
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PencilIcon className="h-4 w-4" />
                </Link>
                <button
                  onClick={handleDeleteClick}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Meta information row */}
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="flex items-center text-gray-500 dark:text-gray-400">
              <CalendarIcon className="h-3.5 w-3.5 mr-1" />
              {formatDate(diary.createdAt)}
            </span>

            <span
              className={`flex items-center px-2 py-0.5 rounded-full ${
                diary.publicity
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              }`}
              title={diary.publicity ? 'Public' : 'Private'}
            >
              {diary.publicity ? (
                <>
                  <EyeIcon className="h-3.5 w-3.5 mr-1" />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <EyeSlashIcon className="h-3.5 w-3.5 mr-1" />
                  <span>Private</span>
                </>
              )}
            </span>
          </div>

          {/* Content preview with fixed height */}
          <div className="flex-grow flex flex-col">
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
              {contentPreview}
            </p>

            {/* Footer with tags and read more */}
            <div className="flex justify-between items-center mt-auto pt-4">
              <div className="flex flex-wrap gap-2 items-center">
                {diary.tags && diary.tags.length > 0
                  ? diary.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))
                  : null}
                {diary.tags && diary.tags.length > 3 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    +{diary.tags.length - 3}
                  </span>
                )}
              </div>

              <Link
                href={`/diary/${diary._id}`}
                className="text-sm text-blue-500 dark:text-blue-400 font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                Read more
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiaryCard
