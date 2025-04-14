'use client'

import ErrorBanner from '@/components/ErrorBanner'
import { Author, IBlogDocument } from '@/models/Blog'
import {
  ArrowLeftIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  EyeIcon,
  HandThumbUpIcon,
  PencilSquareIcon,
  TagIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import DOMPurify from 'isomorphic-dompurify'
import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { Montserrat } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import useSWR from 'swr'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

// Extend Session type to include user ID for Next Auth
interface CustomSession extends Session {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

const BlogDetail = () => {
  const router = useRouter()
  const { slug } = useParams()
  const { data: session } = useSession() as { data: CustomSession | null }
  const [likeCount, setLikeCount] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  // Set mounted state after component mounts on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch blog post
  const { data: blog, error: fetchError } = useSWR<IBlogDocument>(
    mounted ? `/api/blog/${slug}` : null,
    async (url: string) => {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch blog post')
      }
      return res.json()
    }
  )

  // Set initial like count and status
  useEffect(() => {
    if (blog) {
      setLikeCount(blog.likes || 0)
      // Check local storage for like status
      const likedBlogIds = JSON.parse(
        localStorage.getItem('likedBlogIds') || '[]'
      )
      setHasLiked(likedBlogIds.includes(blog._id))
    }
  }, [blog])

  // Format date
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'Recent'

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Handle like/unlike
  const handleLike = async () => {
    if (!blog) return

    const action = hasLiked ? 'unlike' : 'like'
    try {
      const response = await fetch('/api/blog/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          blogId: blog._id,
          action
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update like')
      }

      // Update like count
      setLikeCount(data.likes)

      // Update local storage
      const likedBlogIds = JSON.parse(
        localStorage.getItem('likedBlogIds') || '[]'
      )
      if (action === 'like') {
        if (!likedBlogIds.includes(blog._id)) {
          likedBlogIds.push(blog._id)
        }
        setHasLiked(true)
      } else {
        const index = likedBlogIds.indexOf(blog._id)
        if (index > -1) {
          likedBlogIds.splice(index, 1)
        }
        setHasLiked(false)
      }
      localStorage.setItem('likedBlogIds', JSON.stringify(likedBlogIds))
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred'
      toast.error(errorMessage)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!blog) return

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch(`/api/blog/${blog._id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete blog post')
      }

      toast.success('Blog post deleted successfully')
      router.push('/blog')
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred while deleting the blog post'
      setError(errorMessage)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Check if user is the author
  const isAuthor = useCallback(() => {
    if (!session || !blog) return false
    return session.user.id === blog.userId
  }, [session, blog])

  // Get author image url or fallback
  const getAuthorImage = (author: Author | string | undefined) => {
    if (!author)
      return 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
    if (typeof author === 'string')
      return 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
    return (
      author.image ||
      'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
    )
  }

  // Get author name or fallback
  const getAuthorName = (author: Author | string | undefined) => {
    if (!author) return 'Anonymous'
    if (typeof author === 'string') return author || 'Anonymous'
    return author.name || 'Anonymous'
  }

  // Initial loading state
  if (!mounted) {
    return (
      <main
        className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
      >
        <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
          <div className="flex justify-between items-center bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-zinc-700">
            <div className="flex items-center gap-4">
              <Link
                href="/blog"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                Loading...
              </h1>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto bg-white/80 dark:bg-zinc-900/80">
            <div className="grid place-items-center h-64">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 bg-blue-200 dark:bg-blue-700 rounded-full mb-4"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (fetchError) {
    return (
      <main
        className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
      >
        <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden p-6">
          <ErrorBanner message="Failed to load blog post. It may have been deleted or doesn't exist." />
          <div className="mt-4">
            <Link
              href="/blog"
              className="text-blue-500 hover:underline flex items-center gap-1"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to blog
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main
      className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
    >
      <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-zinc-700">
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
              {blog?.title || 'Loading...'}
            </h1>
          </div>

          {isAuthor() && (
            <div className="flex gap-2">
              <Link href={`/blog/edit/${blog?._id || slug}`}>
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700">
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="flex-grow overflow-y-auto bg-white/80 dark:bg-zinc-900/80">
          {error && <ErrorBanner message={error} />}

          {!blog ? (
            <div className="grid place-items-center h-64">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 bg-blue-200 dark:bg-blue-700 rounded-full mb-4"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Cover image */}
              {blog.coverImage && (
                <div className="w-full h-64 sm:h-80 md:h-96 relative">
                  <Image
                    src={blog.coverImage}
                    alt={blog.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Title and metadata */}
                <div className="mb-8">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {blog.title}
                  </h1>

                  <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-x-6 gap-y-2">
                    <div className="flex items-center">
                      <div className="relative w-6 h-6 mr-2">
                        <Image
                          src={getAuthorImage(blog.author)}
                          alt={getAuthorName(blog.author)}
                          className="rounded-full"
                          fill
                          sizes="24px"
                        />
                      </div>
                      <span>{getAuthorName(blog.author)}</span>
                    </div>

                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>
                        {formatDate(blog.publishedAt || blog.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      <span>{blog.readTime || '5 min'} read</span>
                    </div>

                    <div className="flex items-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      <span>{blog.views || 0} views</span>
                    </div>
                  </div>

                  {blog.category && (
                    <div className="mt-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-200">
                        {blog.category.charAt(0).toUpperCase() +
                          blog.category.slice(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="mb-8">
                  <div className="text-lg text-gray-500 dark:text-gray-400 italic border-l-4 border-gray-300 dark:border-gray-700 pl-4 py-2">
                    {blog.summary}
                  </div>
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none dark:prose-invert prose-img:rounded-lg prose-headings:font-semibold prose-a:text-blue-600 dark:prose-a:text-blue-400">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(blog.content)
                    }}
                  />
                </div>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="mt-12 pt-6 border-t border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center flex-wrap gap-2">
                      <TagIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      {blog.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/blog?tag=${tag}`}
                          className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                        hasLiked
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <HandThumbUpIcon
                        className={`w-5 h-5 ${
                          hasLiked ? 'fill-blue-500 text-blue-500' : ''
                        }`}
                      />
                      <span>{likeCount}</span>
                    </button>

                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition">
                      <ChatBubbleLeftRightIcon className="w-5 h-5" />
                      <span>0</span>
                    </button>
                  </div>

                  <Link
                    href="/blog"
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    More posts
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Delete blog post?
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              This action cannot be undone. The blog post will be permanently
              deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded-lg text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default BlogDetail
