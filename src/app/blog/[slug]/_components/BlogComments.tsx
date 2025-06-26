'use client'

import { IComment } from '@/models/Comment'
import { HeartIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface BlogCommentsProps {
  blogId: string
}

interface Session {
  user?: {
    email: string
    name: string
  }
}

const BlogComments = ({ blogId }: BlogCommentsProps) => {
  const [comments, setComments] = useState<IComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [session, setSession] = useState<Session | null>(null)

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const sessionData = await response.json()
      setSession(sessionData)
    } catch (error) {
      console.error('Error checking auth:', error)
    }
  }

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/blog/${blogId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }, [blogId])

  useEffect(() => {
    fetchComments()
    checkAuth()
  }, [blogId, fetchComments])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/blog/${blogId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() })
      })

      if (response.ok) {
        setNewComment('')
        await fetchComments()
        toast.success('Comment added successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = async (commentId: string) => {
    if (!session?.user) {
      toast.error('Please sign in to like comments')
      return
    }

    try {
      const response = await fetch(
        `/api/blog/${blogId}/comments/${commentId}/like`,
        {
          method: 'POST'
        }
      )

      if (response.ok) {
        await fetchComments()
      }
    } catch (error) {
      console.error('Error liking comment:', error)
    }
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
        Comments ({comments.length})
      </h3>

      {/* Add Comment Form */}
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
            disabled={!newComment.trim() || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div
            key={comment._id}
            className="border-b border-gray-200 dark:border-zinc-700 pb-4 last:border-b-0"
          >
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
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
                      ? formatDistanceToNow(
                          new Date(comment.createdAt || Date.now()),
                          {
                            addSuffix: true
                          }
                        )
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
                      comment.likedBy?.includes(session?.user?.email || '')
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

      {comments.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  )
}

export default BlogComments
