'use client'

import { IPhoto } from '@/models/Photo'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'react-toastify'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const PhotosWidget = () => {
  const { data: session } = useSession()
  const {
    data: photos,
    error,
    mutate,
    isLoading
  } = useSWR<IPhoto[]>('/api/photos', fetcher)
  const [selectedPhoto, setSelectedPhoto] = useState<IPhoto | null>(null)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const isAdmin = session?.user?.role === 'admin'

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUploading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        toast.success('Photo uploaded successfully!')
        mutate()
        setShowUploadForm(false)
        e.currentTarget.reset()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to upload photo')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload photo')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Photo deleted successfully!')
        mutate()
        setSelectedPhoto(null)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete photo')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete photo')
    }
  }

  if (error) {
    return (
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-white/20 h-full">
        <div className="text-center text-red-500">Failed to load photos</div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-white/20 h-full">
        {/* Mobile Compact Layout */}
        <div className="sm:hidden h-full flex flex-col">
          {/* Header - Compact */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Image
                src="/images/icons/photos.png"
                alt="Photos"
                width={14}
                height={14}
              />
              <h2 className="text-xs font-semibold text-gray-900 dark:text-white">
                Gallery
              </h2>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="text-blue-500 hover:text-blue-600 transition-colors text-[9px] font-medium px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded-full"
              >
                {showUploadForm ? '✕' : '+'}
              </button>
            )}
          </div>

          {/* Upload Form - Mobile Compact */}
          {showUploadForm && isAdmin && (
            <div className="mb-1.5 space-y-1">
              <input
                type="file"
                accept="image/*"
                className="w-full text-[8px] text-gray-500 file:mr-1.5 file:py-0.5 file:px-1.5 file:rounded-full file:border-0 file:text-[8px] file:font-semibold file:bg-blue-50 file:text-blue-700"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const formData = new FormData()
                    formData.append('file', e.target.files[0])
                    formData.append('title', e.target.files[0].name)
                    formData.append('isPublic', 'true')

                    setIsUploading(true)
                    fetch('/api/photos', {
                      method: 'POST',
                      body: formData
                    })
                      .then((response) => {
                        if (response.ok) {
                          toast.success('Photo uploaded!')
                          mutate()
                          setShowUploadForm(false)
                        } else {
                          toast.error('Upload failed')
                        }
                      })
                      .finally(() => {
                        setIsUploading(false)
                      })
                  }
                }}
              />
            </div>
          )}

          {/* Photos Grid - Mobile */}
          <div className="flex-1">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 mb-2 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center animate-pulse">
                  <Image
                    src="/images/icons/photos.png"
                    alt="Loading"
                    width={12}
                    height={12}
                    className="opacity-50"
                  />
                </div>
                <p className="text-[9px] text-gray-500 dark:text-gray-400 animate-pulse">
                  Loading photos...
                </p>
              </div>
            ) : photos?.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 mb-2 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Image
                    src="/images/icons/photos.png"
                    alt="No photos"
                    width={16}
                    height={16}
                    className="opacity-50"
                  />
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  No photos yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 h-full">
                {photos?.slice(0, 6).map((photo, index) => (
                  <button
                    key={photo._id}
                    onClick={() => setSelectedPhoto(photo)}
                    className={`relative rounded-md overflow-hidden group hover:scale-105 transition-transform ${
                      index < 3 ? 'aspect-square' : 'aspect-square'
                    }`}
                  >
                    <Image
                      src={photo.imageUrl}
                      alt={photo.title}
                      fill
                      sizes="33vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </button>
                ))}

                {/* Show count if more photos */}
                {photos && photos.length > 6 && (
                  <div className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[7px] px-1 py-0.5 rounded-full">
                    +{photos.length - 6}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tablet and Desktop Layout */}
        <div className="hidden sm:block h-full">
          <div className="flex items-center justify-between mb-3 sm:mb-4 xl:mb-6">
            <h2 className="text-base sm:text-lg xl:text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 xl:gap-3">
              <Image
                src="/images/icons/photos.png"
                alt="Photos"
                width={20}
                height={20}
                className="sm:w-6 sm:h-6 xl:w-8 xl:h-8"
              />
              <span className="hidden sm:inline">Photos</span>
              <span className="sm:hidden">Gallery</span>
            </h2>
            {isAdmin && (
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="text-blue-500 hover:text-blue-600 transition-colors text-xs sm:text-sm xl:text-base font-medium"
              >
                {showUploadForm ? 'Cancel' : 'Add'}
              </button>
            )}
          </div>

          {showUploadForm && isAdmin && (
            <form
              onSubmit={handleUpload}
              className="mb-3 sm:mb-4 xl:mb-6 space-y-2 sm:space-y-3 xl:space-y-4"
            >
              <div>
                <input
                  type="file"
                  name="file"
                  accept="image/*"
                  required
                  className="w-full text-xs sm:text-sm xl:text-base text-gray-500 file:mr-3 sm:file:mr-4 file:py-1.5 sm:file:py-2 xl:file:py-3 file:px-3 sm:file:px-4 xl:file:px-6 file:rounded-full file:border-0 file:text-xs sm:file:text-sm xl:file:text-base file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="title"
                  placeholder="Photo title"
                  required
                  className="w-full px-3 xl:px-4 py-2 xl:py-3 rounded-lg xl:rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm xl:text-base"
                />
              </div>
              <div className="hidden sm:block">
                <textarea
                  name="description"
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full px-3 xl:px-4 py-2 xl:py-3 rounded-lg xl:rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm xl:text-base"
                />
              </div>
              <div className="flex items-center gap-2 xl:gap-3">
                <input
                  type="checkbox"
                  name="isPublic"
                  id="isPublic"
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 xl:w-4 xl:h-4"
                />
                <label
                  htmlFor="isPublic"
                  className="text-xs sm:text-sm xl:text-base text-gray-700 dark:text-gray-300"
                >
                  Make public
                </label>
              </div>
              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 xl:py-3 px-4 xl:px-6 rounded-lg xl:rounded-xl font-medium transition-colors text-xs sm:text-sm xl:text-base"
              >
                {isUploading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </form>
          )}

          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
              <div className="w-12 h-12 sm:w-16 sm:h-16 xl:w-20 xl:h-20 mb-3 sm:mb-4 xl:mb-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center animate-pulse">
                <Image
                  src="/images/icons/photos.png"
                  alt="Loading"
                  width={24}
                  height={24}
                  className="opacity-50 sm:w-8 sm:h-8 xl:w-10 xl:h-10"
                />
              </div>
              <p className="text-xs sm:text-sm xl:text-base animate-pulse">
                Loading photos...
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 xl:gap-4">
                {photos?.slice(0, 6).map((photo) => (
                  <button
                    key={photo._id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="aspect-square relative rounded-lg xl:rounded-xl overflow-hidden group hover:scale-105 transition-transform"
                  >
                    <Image
                      src={photo.imageUrl}
                      alt={photo.title}
                      fill
                      sizes="(max-width: 640px) 25vw, (max-width: 1024px) 15vw, 10vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </button>
                ))}
              </div>

              {photos && photos.length > 6 && (
                <div className="mt-2 sm:mt-3 xl:mt-4 text-center">
                  <span className="text-xs sm:text-sm xl:text-base text-gray-500 dark:text-gray-400">
                    +{photos.length - 6} more
                  </span>
                </div>
              )}

              {photos?.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 xl:w-20 xl:h-20 mb-3 sm:mb-4 xl:mb-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Image
                      src="/images/icons/photos.png"
                      alt="No photos"
                      width={24}
                      height={24}
                      className="opacity-50 sm:w-8 sm:h-8 xl:w-10 xl:h-10"
                    />
                  </div>
                  <p className="text-xs sm:text-sm xl:text-base">
                    No photos yet
                  </p>
                  {isAdmin && (
                    <p className="text-xs xl:text-sm mt-1 hidden sm:block">
                      Click &quot;Add Photo&quot; to get started
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video max-h-[70vh]">
              <Image
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-contain"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
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
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedPhoto.title}
                  </h3>
                  {selectedPhoto.description && (
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                      {selectedPhoto.description}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                    {new Date(selectedPhoto.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(selectedPhoto._id)}
                    className="ml-4 text-red-500 hover:text-red-600 transition-colors px-3 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-xs sm:text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PhotosWidget
