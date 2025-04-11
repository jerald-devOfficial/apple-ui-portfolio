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
  featured?: boolean
  onDelete?: (id: string) => void
}

const DiaryCard: FC<DiaryCardProps> = ({
  diary,
  isOwner = false,
  featured = false,
  onDelete
}) => {
  const [contentPreview, setContentPreview] = useState<string>('')

  // Handle delete click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    if (onDelete) {
      onDelete(diary._id)
    }
  }

  // Log diary data for debugging
  console.log('DiaryCard received:', {
    id: diary._id,
    title: diary.title,
    hasContent: !!diary.content,
    createdAt: diary.createdAt || 'No date',
    featured
  })

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
      // Create a temporary div to parse HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlContent

      // Clean up TinyMCE specific elements for code blocks
      const codeBlocks = tempDiv.querySelectorAll('pre, code')
      codeBlocks.forEach((block) => {
        block.textContent = '[code block]'
      })

      // Get plain text and limit to appropriate length based on featured status
      const text = tempDiv.textContent || tempDiv.innerText || ''
      const maxLength = featured ? 240 : 120
      return text.length > maxLength
        ? `${text.substring(0, maxLength).trim()}...`
        : text
    }

    setContentPreview(getContentPreview(diary.content))
  }, [diary.content, featured])

  return (
    <div className="h-full">
      <div
        className={`group rounded-xl overflow-hidden bg-white dark:bg-zinc-800 shadow-sm border border-gray-200 dark:border-zinc-700 hover:shadow-md transition duration-300 mb-4 h-full flex flex-col ${
          featured ? 'featured-card' : ''
        }`}
      >
        <div
          className={`p-5 flex flex-col flex-grow ${
            featured ? 'featured-content' : ''
          }`}
        >
          {/* Header with title, owner indicator, and action buttons */}
          <div className="flex justify-between items-start mb-1">
            <Link href={`/diary/${diary._id}`} className="flex-grow">
              <h3
                className={`font-medium text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors ${
                  featured ? 'text-xl' : 'text-lg'
                }`}
              >
                {diary.title}
                {isOwner && (
                  <span
                    className="ml-2 inline-flex items-center"
                    title="Your diary"
                  >
                    <UserIcon
                      className={`text-blue-500 dark:text-blue-400 ${
                        featured ? 'h-5 w-5' : 'h-4 w-4'
                      }`}
                    />
                  </span>
                )}
              </h3>
            </Link>

            {/* Action buttons for owner */}
            {isOwner && (
              <div className="flex items-center gap-2 ml-4">
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
            {/* Date on the left */}
            <span className="flex items-center text-gray-500 dark:text-gray-400">
              <CalendarIcon className="h-3.5 w-3.5 mr-1" />
              {formatDate(diary.createdAt)}
            </span>

            {/* Visibility indicator on the right */}
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

          <Link href={`/diary/${diary._id}`} className="flex-grow">
            <p
              className={`text-gray-600 dark:text-gray-300 mb-3 ${
                featured ? 'text-base' : 'text-sm'
              }`}
            >
              {contentPreview}
            </p>

            {/* Footer with tags and read more */}
            <div className="flex justify-between items-center mt-3">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {diary.tags && diary.tags.length > 0
                  ? diary.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))
                  : null}
              </div>

              {/* Read more link */}
              <div className="text-sm text-blue-500 dark:text-blue-400 font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                Read more
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DiaryCard
