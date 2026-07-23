'use client'

import PhotoDetailModal from '@/components/PhotoDetailModal'
import PhotosUploadSheet from '@/components/PhotosUploadSheet'
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
  const [showUploadSheet, setShowUploadSheet] = useState(false)

  const isAdmin = session?.user?.role === 'admin'

  const openUploadSheet = () => {
    if (!isAdmin) {
      toast.info('Sign in as admin to upload photos')
      return
    }
    setShowUploadSheet(true)
  }

  const handleDelete = async (photoId: string) => {
    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Photo deleted successfully!')
        mutate()
        setSelectedPhoto(null)
        return true
      }

      const errorData = await response.json()
      toast.error(errorData.error || 'Failed to delete photo')
      return false
    } catch (deleteError) {
      console.error('Delete error:', deleteError)
      toast.error('Failed to delete photo')
      return false
    }
  }

  if (error) {
    return (
      <div className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-white/20 h-full">
        <div className="text-center text-red-500">Failed to load photos</div>
      </div>
    )
  }

  const photoGrid = (compact: boolean) => {
    if (isLoading) {
      return (
        <div className="flex flex-1 items-center justify-center min-h-0">
          <div className="flex flex-col items-center text-center">
            <div
              className={`${compact ? 'w-8 h-8 mb-2' : 'w-12 h-12 sm:w-16 sm:h-16 xl:w-20 xl:h-20 mb-3 sm:mb-4 xl:mb-6'} bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center animate-pulse`}
            >
              <Image
                src="/images/icons/photos.png"
                alt="Loading"
                width={compact ? 12 : 24}
                height={compact ? 12 : 24}
                className={compact ? 'opacity-50' : 'opacity-50 sm:w-8 sm:h-8 xl:w-10 xl:h-10'}
              />
            </div>
            <p
              className={`${compact ? 'text-[9px]' : 'text-xs sm:text-sm xl:text-base'} text-gray-500 dark:text-gray-400 animate-pulse`}
            >
              Loading photos...
            </p>
          </div>
        </div>
      )
    }

    if (!photos?.length) {
      return (
        <div className="flex flex-1 items-center justify-center min-h-0">
          <button
            type="button"
            onClick={isAdmin ? openUploadSheet : undefined}
            disabled={!isAdmin}
            className={`flex flex-col items-center text-center ${isAdmin ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
          >
            <div
              className={`${compact ? 'w-8 h-8 mb-2' : 'w-12 h-12 sm:w-16 sm:h-16 xl:w-20 xl:h-20 mb-3 sm:mb-4 xl:mb-6'} bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center`}
            >
              <Image
                src="/images/icons/photos.png"
                alt="No photos"
                width={compact ? 16 : 24}
                height={compact ? 16 : 24}
                className={compact ? 'opacity-50' : 'opacity-50 sm:w-8 sm:h-8 xl:w-10 xl:h-10'}
              />
            </div>
            <p
              className={`${compact ? 'text-[10px]' : 'text-xs sm:text-sm xl:text-base'} text-gray-500 dark:text-gray-400`}
            >
              No photos yet
            </p>
            {isAdmin && (
              <p
                className={`${compact ? 'text-[9px] mt-0.5' : 'text-xs xl:text-sm mt-1'} text-blue-500`}
              >
                Tap Add to get started
              </p>
            )}
          </button>
        </div>
      )
    }

    return (
      <div className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div
          className={`grid grid-cols-3 ${compact ? 'gap-1' : 'gap-1.5 sm:gap-2 xl:gap-4'}`}
        >
          {photos.map((photo) => (
            <button
              key={photo._id}
              type="button"
              onClick={() => setSelectedPhoto(photo)}
              className={`relative aspect-square overflow-hidden group ${compact ? 'rounded-md' : 'rounded-lg xl:rounded-xl'}`}
            >
              <div className="absolute inset-0 transition-transform duration-200 ease-out group-hover:scale-105">
                <Image
                  src={photo.imageUrl}
                  alt={photo.title}
                  fill
                  sizes={compact ? '33vw' : '(max-width: 640px) 25vw, (max-width: 1024px) 15vw, 10vw'}
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-white/20 h-full overflow-hidden">
        {/* Mobile Layout */}
        <div className="relative z-10 sm:hidden h-full flex flex-col">
          <div className="relative z-20 flex items-center justify-between mb-1 shrink-0">
            <div className="flex items-center gap-1">
              <Image
                src="/images/icons/photos.png"
                alt="Photos"
                width={12}
                height={12}
              />
              <h2 className="text-[11px] font-semibold text-gray-900 dark:text-white">
                Gallery
              </h2>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={openUploadSheet}
                className="relative z-20 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 text-blue-500 hover:text-blue-600 transition-colors text-sm font-semibold bg-blue-50 dark:bg-blue-900/30 rounded-full"
                aria-label="Add photos"
              >
                +
              </button>
            )}
          </div>

          <div className="flex-1 min-h-0 flex flex-col">{photoGrid(true)}</div>
        </div>

        {/* Tablet and Desktop Layout */}
        <div className="relative z-10 hidden sm:flex sm:flex-col h-full">
          <div className="relative z-20 flex items-center justify-between mb-3 sm:mb-4 xl:mb-6 shrink-0">
            <h2 className="text-base sm:text-lg xl:text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 xl:gap-3">
              <Image
                src="/images/icons/photos.png"
                alt="Photos"
                width={20}
                height={20}
                className="sm:w-6 sm:h-6 xl:w-8 xl:h-8"
              />
              <span>Photos</span>
            </h2>
            {isAdmin && (
              <button
                type="button"
                onClick={openUploadSheet}
                className="relative z-20 min-h-[44px] px-4 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-xs sm:text-sm xl:text-base font-medium rounded-lg"
              >
                Add
              </button>
            )}
          </div>

          <div className="flex-1 min-h-0 flex flex-col">{photoGrid(false)}</div>
        </div>
      </div>

      <PhotosUploadSheet
        isOpen={showUploadSheet}
        onClose={() => setShowUploadSheet(false)}
        onUploaded={() => mutate()}
      />

      {selectedPhoto && (
        <PhotoDetailModal
          photo={selectedPhoto}
          isAdmin={isAdmin}
          onClose={() => setSelectedPhoto(null)}
          onDelete={handleDelete}
        />
      )}
    </>
  )
}

export default PhotosWidget
