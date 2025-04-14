'use client'

import { fetcher } from '@/lib/fetcher'
import { IDiary } from '@/models/Diary'
import {
  ArrowLeftIcon,
  HeartIcon as HeartIconOutline,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { Editor } from '@tinymce/tinymce-react'
import { useSession } from 'next-auth/react'
import { Montserrat } from 'next/font/google'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import useSWR from 'swr'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

// Loading component
const LoadingView = () => (
  <main
    className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
  >
    <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md px-6 py-3 border-b border-gray-200 dark:border-zinc-700">
        <Link href="/diaries">
          <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-x-1">
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>
        </Link>
      </div>

      {/* Loading indicator */}
      <div className="grow p-6 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 bg-blue-200 dark:bg-blue-700 rounded-full mb-4"></div>
          <div className="h-4 w-40 bg-gray-200 dark:bg-zinc-700 rounded mb-2"></div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded"></div>
        </div>
      </div>
    </div>
  </main>
)

// Error component
const ErrorView = ({ error }: { error: string }) => (
  <main
    className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
  >
    <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md px-6 py-3 border-b border-gray-200 dark:border-zinc-700">
        <Link href="/diaries">
          <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-x-1">
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>
        </Link>
      </div>

      {/* Error message */}
      <div className="grow p-6 flex flex-col items-center justify-center">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <Link href="/diaries">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-x-2 hover:bg-blue-600 transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Diaries</span>
          </button>
        </Link>
      </div>
    </div>
  </main>
)

const DiaryView = () => {
  const { id } = useParams()
  const { push } = useRouter()
  const { data: session, status } = useSession()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [editorConfig, setEditorConfig] = useState({
    skin: 'oxide',
    content_css: 'default'
  })

  // Use SWR for data fetching
  const {
    data: diary,
    error,
    isLoading,
    mutate
  } = useSWR<IDiary>(`/api/diary/${id}`, fetcher)

  // Determine if the current user is the diary owner or the site owner
  const isOwner =
    status === 'authenticated' &&
    diary?.userId &&
    session?.user?.email &&
    diary.userId.toLowerCase() === session.user.email.toLowerCase()

  // Simplified site owner check using environment variable as fallback
  const ownerEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL!
  const isSiteOwner =
    status === 'authenticated' &&
    session?.user?.email?.toLowerCase() === ownerEmail.toLowerCase()

  const canEditOrDelete = isOwner || isSiteOwner

  const handleDelete = async () => {
    if (
      !diary ||
      !confirm('Are you sure you want to delete this diary entry?')
    ) {
      return
    }

    setIsDeleting(true)

    try {
      const res = await fetch(`/api/diary/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error('Failed to delete diary entry')
      }

      push('/diaries')
    } catch (err) {
      console.error(err)
      setIsDeleting(false)
    }
  }

  const handleLike = useCallback(async () => {
    if (!diary?._id) return

    try {
      const response = await fetch(`/api/diary/${diary._id}/like`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to like diary')
      }

      setIsLiked(true)
      toast.success('Diary liked!')
      mutate()
    } catch (err) {
      toast.error('Failed to like diary')
      console.error(err)
    }
  }, [diary?._id, mutate])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
      setEditorConfig({
        skin: isDarkMode ? 'oxide-dark' : 'oxide',
        content_css: isDarkMode ? 'dark' : 'default'
      })

      // Listen for theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        setEditorConfig({
          skin: e.matches ? 'oxide-dark' : 'oxide',
          content_css: e.matches ? 'dark' : 'default'
        })
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  if (isLoading) {
    return <LoadingView />
  }

  if (error || !diary) {
    return <ErrorView error={error?.message || 'Diary entry not found'} />
  }

  return (
    <main
      className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
    >
      <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md px-6 py-3 border-b border-gray-200 dark:border-zinc-700">
          <Link href="/diaries">
            <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-x-1">
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back</span>
            </button>
          </Link>

          <div className="flex items-center gap-x-4">
            {canEditOrDelete && (
              <>
                <Link href={`/diary/${diary._id}/edit`}>
                  <button className="text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-x-1">
                    <PencilIcon className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </Link>

                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-x-1 disabled:opacity-50"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              </>
            )}
            <button
              onClick={handleLike}
              className="text-red-500 hover:text-red-600 transition-colors"
              aria-label={isLiked ? 'Unlike diary' : 'Like diary'}
            >
              {isLiked ? (
                <HeartIconSolid className="w-6 h-6" />
              ) : (
                <HeartIconOutline className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Title & metadata */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {diary.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span>
              Today at{' '}
              {diary.createdAt &&
                new Date(diary.createdAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true
                })}
            </span>
            <span>•</span>
            <span>{diary.publicity ? 'Public' : 'Private'}</span>

            {diary.tags && diary.tags.length > 0 && (
              <>
                <span>•</span>
                <div className="flex flex-wrap gap-2">
                  {diary.tags?.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-sm bg-stone-300 dark:bg-zinc-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="grow p-6 overflow-y-auto">
          <Editor
            value={diary.content}
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
            disabled={true}
            init={{
              height: '100%',
              menubar: false,
              toolbar: false,
              plugins: ['codesample'],
              statusbar: false,
              branding: false,
              inline: true,
              skin: editorConfig.skin,
              content_css: editorConfig.content_css,
              content_style: `
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                  font-size: 16px;
                  line-height: 1.6;
                  padding: 0;
                  margin: 0;
                  background-color: transparent;
                  color: var(--tw-prose-body);
                }
                p {
                  margin: 0 0 1em 0;
                }
                h1, h2, h3, h4, h5, h6 {
                  color: var(--tw-prose-headings);
                }
                code {
                  font-family: 'Consolas', monospace;
                  background-color: var(--tw-prose-pre-bg);
                  padding: .1em .2em;
                  border-radius: 3px;
                }
                pre {
                  background-color: var(--tw-prose-pre-bg) !important;
                  border: 1px solid var(--tw-prose-pre-border) !important;
                  border-radius: 6px !important;
                  padding: 1em !important;
                }
                pre code {
                  background-color: transparent !important;
                }
                .language-markup,
                .language-javascript,
                .language-typescript,
                .language-css,
                .language-jsx,
                .language-tsx {
                  background-color: var(--tw-prose-pre-bg) !important;
                }
              `
            }}
          />
        </div>
      </div>
    </main>
  )
}

export default DiaryView
