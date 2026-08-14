'use client'

import { fetcher } from '@/lib/fetcher'
import { IComment } from '@/models/Comment'
import { HeartIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useOptimistic, useState, useTransition } from 'react'
import { toast } from 'react-toastify'
import useSWR from 'swr'

interface BlogCommentsProps {
  blogId: string
}

const BlogComments = ({ blogId }: BlogCommentsProps) => {
  const { data: session, status } = useSession()
  const [newComment, setNewComment] = useState('')
  const [isPending, startTransition] = useTransition()
  const {
    data: comments = [],
    mutate,
    isLoading
  } = useSWR<IComment[]>(
    status === 'authenticated' ? `/api/blog/${blogId}/comments` : null,
    fetcher
  )
  const userId = session?.user?.id

  const [optimisticComments, updateOptimisticComment] = useOptimistic(
    comments,
    (state, likedCommentId: string) => {
      if (!userId) return state

      return state.map((comment) => {
        if (comment._id !== likedCommentId) return comment

        const likedBy = comment.likedBy || []
        const alreadyLiked = likedBy.includes(userId)

        return {
          ...comment,
          likes: alreadyLiked
            ? Math.max((comment.likes || 0) - 1, 0)
            : (comment.likes || 0) + 1,
          likedBy: alreadyLiked
            ? likedBy.filter((id) => id !== userId)
            : [...likedBy, userId]
        }
      })
    }
  )

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isPending) return

    const content = newComment.trim()

    startTransition(async () => {
      try {
        const response = await fetch(`/api/blog/${blogId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        })

        if (response.ok) {
          setNewComment('')
          await mutate()
          toast.success('Comment added successfully!')
        } else {
          const error = await response.json()
          toast.error(error.error || 'Failed to add comment')
        }
      } catch (error) {
        console.error('Error submitting comment:', error)
        toast.error('Failed to add comment')
      }
    })
  }

  const handleLike = (commentId: string) => {
    if (!userId) {
      toast.error('Please sign in to like comments')
      return
    }

    startTransition(async () => {
      updateOptimisticComment(commentId)

      try {
        const response = await fetch(
          `/api/blog/${blogId}/comments/${commentId}/like`,
          { method: 'POST' }
        )

        await mutate()
        if (!response.ok) {
          toast.error('Failed to update like')
        }
      } catch (error) {
        console.error('Error liking comment:', error)
        await mutate()
        toast.error('Failed to update like')
      }
    })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-gray-200 dark:border-zinc-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Comments
        </h3>
        <p className="text-gray-600 dark:text-gray-300">Loading comments...</p>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-gray-200 dark:border-zinc-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Comments
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Please sign in to view and add comments.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-gray-200 dark:border-zinc-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Comments ({optimisticComments.length})
      </h3>

      <form onSubmit={handleSubmitComment} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full p-3 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={!newComment.trim() || isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {optimisticComments.map((comment) => (
          <div
            key={comment._id}
            className="border-b border-gray-200 dark:border-zinc-700 pb-4 last:border-b-0"
          >
            <div className="flex space-x-3">
              <div className="shrink-0">
                <Image
                  src={comment.author.avatar || '/images/icons/login.png'}
                  alt={comment.author.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {comment.author.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {comment.createdAt
                      ? formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true
                        })
                      : 'Recently'}
                  </span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {comment.content}
                </p>

                <div className="flex items-center space-x-4 text-sm">
                  <button
                    onClick={() => handleLike(comment._id)}
                    className={`flex items-center space-x-1 transition-colors ${
                      comment.likedBy?.includes(userId || '')
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                  >
                    <HeartIcon className="w-4 h-4" />
                    <span>{comment.likes || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {optimisticComments.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  )
}

export default BlogComments
