'use client'

import { deleteDiaryAction } from '@/app/diary/actions'
import { IDiary } from '@/models/Diary'
import {
  HeartIcon as HeartIconOutline,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useOptimistic, useState, useTransition } from 'react'
import { toast } from 'react-toastify'

const DiaryViewActions = ({ diary }: { diary: IDiary }) => {
  const { data: session, status } = useSession()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [liked, setLiked] = useState(Boolean(diary.liked))
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(liked)

  const isOwner =
    status === 'authenticated' &&
    diary.userId &&
    session?.user?.email &&
    diary.userId.toLowerCase() === session.user.email.toLowerCase()

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase()
  const isSiteOwner =
    status === 'authenticated' &&
    (session?.user?.role === 'admin' ||
      Boolean(
        session?.user?.email &&
          adminEmail &&
          session.user.email.toLowerCase() === adminEmail
      ))

  const canEditOrDelete = isOwner || isSiteOwner

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this diary entry?')) {
      return
    }

    setIsDeleting(true)
    const result = await deleteDiaryAction(diary._id)

    if (result && !result.success) {
      toast.error(result.error ?? 'Failed to delete diary entry')
      setIsDeleting(false)
    }
  }

  const handleLike = () => {
    if (isPending) return

    if (status !== 'authenticated') {
      toast.error('Please sign in to like diaries')
      return
    }

    const nextLiked = !liked

    startTransition(async () => {
      setOptimisticLiked(nextLiked)

      try {
        const response = await fetch(`/api/diary/${diary._id}/like`, {
          method: 'POST'
        })

        if (!response.ok) {
          throw new Error('Failed to update like')
        }

        const data = (await response.json()) as { liked?: boolean }
        setLiked(Boolean(data.liked))
        toast.success(data.liked ? 'Diary liked!' : 'Like removed')
      } catch (err) {
        toast.error('Failed to update like')
        console.error(err)
      }
    })
  }

  return (
    <div className="flex items-center gap-x-4">
      {canEditOrDelete ? (
        <>
          <Link href={`/diary/${diary._id}/edit`}>
            <button
              type="button"
              className="text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-x-1"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </Link>

          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-x-1 disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4" />
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </>
      ) : null}
      <button
        type="button"
        onClick={handleLike}
        disabled={isPending}
        className="text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
        aria-label={optimisticLiked ? 'Unlike diary' : 'Like diary'}
      >
        {optimisticLiked ? (
          <HeartIconSolid className="w-6 h-6" />
        ) : (
          <HeartIconOutline className="w-6 h-6" />
        )}
      </button>
    </div>
  )
}

export default DiaryViewActions
