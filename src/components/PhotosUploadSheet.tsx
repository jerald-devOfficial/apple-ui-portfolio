'use client'

import { MAX_PHOTO_SIZE_MB, uploadPhoto, validatePhotoFile } from '@/lib/photos'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { toast } from 'react-toastify'

type PhotosUploadSheetProps = {
  isOpen: boolean
  onClose: () => void
  onUploaded: () => void
}

const PhotosUploadSheet = ({
  isOpen,
  onClose,
  onUploaded
}: PhotosUploadSheetProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [captureDate, setCaptureDate] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })

  const resetForm = () => {
    setSelectedFiles([])
    setTitle('')
    setCaption('')
    setCaptureDate('')
    setIsPublic(true)
    setUploadProgress({ current: 0, total: 0 })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    if (isUploading) return
    resetForm()
    onClose()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const validFiles: File[] = []
    const errors: string[] = []

    files.forEach((file) => {
      const error = validatePhotoFile(file)
      if (error) {
        errors.push(error)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length) {
      toast.error(errors[0])
    }

    if (validFiles.length) {
      setSelectedFiles((prev) => {
        const existing = new Set(
          prev.map((f) => `${f.name}-${f.size}-${f.lastModified}`)
        )
        const next = [...prev]

        validFiles.forEach((file) => {
          const key = `${file.name}-${file.size}-${file.lastModified}`
          if (!existing.has(key)) {
            next.push(file)
          }
        })

        return next
      })
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const resolveTitle = (index: number) => {
    const trimmed = title.trim()
    if (!trimmed) {
      return selectedFiles.length === 1 ? 'Untitled' : `Untitled (${index + 1})`
    }
    return selectedFiles.length === 1 ? trimmed : `${trimmed} (${index + 1})`
  }

  const handleUpload = async () => {
    if (!selectedFiles.length || isUploading) return

    if (selectedFiles.length === 1 && !title.trim()) {
      toast.error('Please add a title')
      return
    }

    setIsUploading(true)
    setUploadProgress({ current: 0, total: selectedFiles.length })

    let successCount = 0
    const failures: string[] = []
    const captionText = caption.trim() || undefined

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      setUploadProgress({ current: i + 1, total: selectedFiles.length })

      try {
        await uploadPhoto(file, {
          title: resolveTitle(i),
          description: captionText,
          isPublic,
          capturedAt: captureDate.trim() || undefined
        })
        successCount++
      } catch (error) {
        failures.push(
          error instanceof Error
            ? error.message
            : `Failed to upload photo ${i + 1}`
        )
      }
    }

    setIsUploading(false)
    setUploadProgress({ current: 0, total: 0 })

    if (successCount) {
      onUploaded()
      toast.success(
        successCount === 1
          ? 'Photo uploaded successfully!'
          : `${successCount} photos uploaded successfully!`
      )
    }

    if (failures.length) {
      toast.error(failures[0])
    }

    if (successCount && !failures.length) {
      resetForm()
      onClose()
    } else if (successCount) {
      setSelectedFiles((prev) => prev.slice(successCount))
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-60 flex items-end sm:items-center justify-center"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Image
              src="/images/icons/photos.png"
              alt="Photos"
              width={24}
              height={24}
            />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add Photos
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
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

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full min-h-13 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-xl font-medium transition-colors text-base"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Choose Photos
          </button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Select one or more images · Max {MAX_PHOTO_SIZE_MB}MB each
          </p>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedFiles.length} photo
                {selectedFiles.length !== 1 ? 's' : ''} selected
              </p>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <li
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                      Photo {index + 1}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">
                      {(file.size / (1024 * 1024)).toFixed(1)}MB
                    </span>
                    {!isUploading && (
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-600 p-1 shrink-0"
                        aria-label={`Remove ${file.name}`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedFiles.length > 0 && (
            <>
              <div>
                <label
                  htmlFor="photo-title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Title{selectedFiles.length === 1 ? '' : ' (optional)'}
                </label>
                <input
                  id="photo-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    selectedFiles.length === 1
                      ? 'Give your photo a title'
                      : 'Shared title prefix for all photos'
                  }
                  disabled={isUploading}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="photo-caption"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Caption (optional)
                </label>
                <textarea
                  id="photo-caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  rows={2}
                  disabled={isUploading}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="photo-date"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Photo date (optional)
                </label>
                <input
                  id="photo-date"
                  type="date"
                  value={captureDate}
                  onChange={(e) => setCaptureDate(e.target.value)}
                  disabled={isUploading}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Leave blank to auto-detect from photo metadata. Use this for
                  edited or renamed photos.
                </p>
              </div>
            </>
          )}

          {selectedFiles.length === 0 && (
            <p className="text-xs text-center text-gray-400 dark:text-neutral-500">
              Title and caption can be added after selecting photos
            </p>
          )}

          <label className="flex items-center gap-3 min-h-11 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={isUploading}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Make public
            </span>
          </label>
        </div>

        <div className="px-5 pb-5 pt-2 border-t border-gray-200 dark:border-gray-700">
          {isUploading && uploadProgress.total > 0 && (
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-3">
              Uploading {uploadProgress.current} of {uploadProgress.total}...
            </p>
          )}
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFiles.length || isUploading}
            className="w-full min-h-13 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-medium transition-colors text-base"
          >
            {isUploading
              ? `Uploading${uploadProgress.total ? ` (${uploadProgress.current}/${uploadProgress.total})` : ''}...`
              : `Upload${selectedFiles.length ? ` (${selectedFiles.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PhotosUploadSheet
