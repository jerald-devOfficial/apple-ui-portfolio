'use client'

import { formatPhotoDate, getPhotoDisplayDate } from '@/lib/photo-metadata'
import { getDisplayTitle } from '@/lib/photos'
import { IPhoto } from '@/models/Photo'
import Image from 'next/image'
import { useState } from 'react'

type PhotoDetailModalProps = {
  photo: IPhoto
  isAdmin: boolean
  onClose: () => void
  onDelete: (photoId: string) => Promise<boolean>
}

const PhotoDetailModal = ({
  photo,
  isAdmin,
  onClose,
  onDelete
}: PhotoDetailModalProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const username = photo.uploadedBy.split('@')[0] || 'gallery'
  const displayTitle = getDisplayTitle(photo.title)
  const formattedDate = formatPhotoDate(getPhotoDisplayDate(photo))

  const handleClose = () => {
    if (isDeleting) return
    onClose()
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(photo._id)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <article
        className="relative w-full max-w-[470px] bg-white dark:bg-neutral-950 border border-gray-300 dark:border-neutral-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Instagram-style header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-white dark:bg-neutral-950 flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/icons/photos.png"
                  alt="Gallery profile"
                  width={18}
                  height={18}
                  className="opacity-80"
                />
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {username}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isAdmin && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="w-9 h-9 flex items-center justify-center text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-900 rounded-full transition-colors"
                  aria-label="More options"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        setShowDeleteConfirm(true)
                      }}
                      className="absolute right-0 top-full mt-1 z-20 whitespace-nowrap px-4 py-2 text-sm text-red-500 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      Delete photo
                    </button>
                  </>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="w-9 h-9 flex items-center justify-center text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-900 rounded-full transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Square image frame */}
        <div className="relative aspect-square bg-black">
          <Image
            src={photo.imageUrl}
            alt={displayTitle || photo.description || 'Photo'}
            fill
            sizes="470px"
            className="object-cover"
            priority
          />
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4 text-gray-900 dark:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </div>
          <svg
            className="w-6 h-6 text-gray-900 dark:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>

        {/* Caption */}
        <div className="px-4 pb-2 space-y-1">
          {displayTitle && (
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {displayTitle}
            </p>
          )}
          {photo.description && (
            <p className="text-sm text-gray-900 dark:text-white leading-snug">
              <span className="font-semibold mr-1.5">{username}</span>
              {photo.description}
            </p>
          )}
          {!displayTitle && !photo.description && (
            <p className="text-sm text-gray-400 dark:text-neutral-500 italic">
              No caption
            </p>
          )}
        </div>

        <p className="px-4 pb-4 text-[10px] uppercase tracking-wide text-gray-400 dark:text-neutral-500">
          {formattedDate}
        </p>

        {showDeleteConfirm && (
          <div
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-[280px] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-neutral-700">
              <div className="px-5 pt-5 pb-3 text-center">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  Delete photo?
                </h4>
                <p className="text-sm text-gray-500 dark:text-neutral-400">
                  This action cannot be undone.
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="w-full py-3.5 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="w-full py-3.5 text-sm font-medium text-gray-900 dark:text-white border-t border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </article>
    </div>
  )
}

export default PhotoDetailModal
