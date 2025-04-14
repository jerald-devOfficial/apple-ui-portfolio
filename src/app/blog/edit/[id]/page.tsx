'use client'

import ErrorBanner from '@/components/ErrorBanner'
import TinyMCEEditor from '@/components/TinyMCEEditor'
import { IBlogDocument } from '@/models/Blog'
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { Montserrat } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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

const BlogEdit = () => {
  const router = useRouter()
  const { id } = useParams()
  const { data: session, status } = useSession() as {
    data: CustomSession | null
    status: string
  }
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  // Form fields
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [category, setCategory] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [featured, setFeatured] = useState(false)
  const [status_, setStatus_] = useState('published')
  const [slug, setSlug] = useState('')

  // Set mounted state after component mounts on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch blog post
  const { data: blog, error: fetchError } = useSWR<IBlogDocument>(
    mounted && id ? `/api/blog/${id}` : null,
    async (url: string) => {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch blog post')
      }
      return res.json()
    },
    {
      revalidateOnFocus: false
    }
  )

  // Set form values from fetched blog
  useEffect(() => {
    if (blog) {
      setTitle(blog.title || '')
      setSummary(blog.summary || '')
      setContent(blog.content || '')
      setCoverImage(blog.coverImage || '')
      setTags(blog.tags || [])
      setCategory(blog.category || '')
      setFeatured(blog.featured || false)
      setStatus_(blog.status || 'published')
      setSlug(blog.slug || '')
    }
  }, [blog])

  // Redirect if not authenticated or not the author
  useEffect(() => {
    if (!mounted) return

    if (status === 'unauthenticated') {
      router.push('/blog')
      return
    }

    // Check if user is the author
    if (blog && session && session.user?.id !== blog.userId) {
      router.push(`/blog/${blog.slug}`)
      toast.error('You are not authorized to edit this blog post')
    }
  }, [blog, session, status, router, mounted])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Validate required fields
    if (!title || !summary || !content) {
      setError('Title, summary, and content are required')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          summary,
          content,
          coverImage,
          tags,
          category,
          featured,
          status: status_
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update blog post')
      }

      toast.success('Blog post updated successfully!')
      router.push(`/blog/${data.blog.slug}`)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred while updating the blog post'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle tag addition
  const addTag = () => {
    if (tagInput && !tags.includes(tagInput.toLowerCase().trim())) {
      setTags([...tags, tagInput.toLowerCase().trim()])
      setTagInput('')
    }
  }

  // Handle tag removal
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Handle tag input keydown (add tag on Enter)
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Edit Blog Post
              </h1>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-white/80 dark:bg-zinc-900/80">
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
              href={`/blog/${slug}`}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Edit Blog Post
            </h1>
          </div>
          <button
            type="submit"
            form="blog-form"
            disabled={isSubmitting}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-x-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
            <span>{isSubmitting ? 'Saving...' : 'Save'}</span>
          </button>
        </div>

        {/* Form area */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-white/80 dark:bg-zinc-900/80">
          {error && <ErrorBanner message={error} />}

          <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Summary */}
            <div>
              <label
                htmlFor="summary"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Summary *
              </label>
              <textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Write a brief summary of your blog post"
                rows={2}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <label
                htmlFor="coverImage"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Cover Image URL
              </label>
              <input
                type="url"
                id="coverImage"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              />
              {coverImage && (
                <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden">
                  <Image
                    src={coverImage}
                    alt="Cover preview"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                    className="object-cover"
                    onError={() => {
                      setCoverImage(
                        'https://via.placeholder.com/800x400?text=Invalid+Image+URL'
                      )
                    }}
                  />
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              >
                <option value="">Select a category</option>
                <option value="technology">Technology</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="tutorial">Tutorial</option>
                <option value="opinion">Opinion</option>
                <option value="news">News</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tags
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Add a tag and press Enter"
                  className="block w-full rounded-l-md border border-gray-300 dark:border-zinc-700 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="rounded-r-md border border-l-0 border-gray-300 dark:border-zinc-700 px-3 bg-gray-50 dark:bg-zinc-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-600"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-sm flex items-center"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="featured"
                  className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Featured post
                </label>
              </div>

              <div className="flex items-center">
                <span className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status:
                </span>
                <select
                  id="status"
                  value={status_}
                  onChange={(e) => setStatus_(e.target.value)}
                  className="rounded-md border border-gray-300 dark:border-zinc-700 py-1 px-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Content *
              </label>
              <TinyMCEEditor
                value={content}
                onEditorChange={(newContent) => setContent(newContent)}
                className="min-h-[400px]"
              />
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default BlogEdit
