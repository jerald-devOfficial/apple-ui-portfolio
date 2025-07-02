'use client'

import TinyMCEEditor from '@/components/TinyMCEEditor'
import { IDiary } from '@/models/Diary'
import { ArrowLeftIcon, ArrowUpCircleIcon } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'
import { Montserrat } from 'next/font/google'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

const EditDiary = () => {
  const { status } = useSession()
  const { push } = useRouter()
  const { id } = useParams()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [publicity, setPublicity] = useState('private')
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { data: diary, error: fetchError } = useSWR<IDiary>(
    `/api/diary/${id}`,
    async (url: string) => {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch diary')
      }
      return res.json()
    }
  )

  useEffect(() => {
    if (status !== 'authenticated') {
      push('/diaries')
    }
  }, [status, push])

  useEffect(() => {
    if (diary) {
      setTitle(diary.title)
      setContent(diary.content)
      setPublicity(diary.publicity ? 'public' : 'private')
      setTags(diary.tags?.join(', ') || '')
    }
  }, [diary])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess(false)

    console.log('Updating diary entry...')

    const isPublic = publicity === 'public'

    try {
      const body = {
        title,
        content,
        publicity: isPublic,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      }

      console.log('Diary data being sent:', {
        title,
        contentLength: content.length,
        publicity: isPublic,
        publicityValue: publicity,
        tags: body.tags
      })

      const res = await fetch(`/api/diary/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ update: body })
      })

      const data = await res.json()

      // Debug logging
      console.log('API Response:', { status: res.status, data })

      if (res.ok) {
        setSuccess(true)
        setError('')

        console.log('Diary updated successfully, redirecting in 1.5 seconds...')

        // Redirect to diary detail page after successful update
        setTimeout(() => {
          push(`/diary/${id}`)
        }, 1500)
      } else {
        console.error(
          'Failed to update diary entry:',
          data.msg || 'Unknown error'
        )
        setError(data.msg || 'Failed to update diary entry')
        setSuccess(false)
      }
    } catch (err) {
      console.error('Error updating diary:', err)
      setError('An error occurred while updating your diary entry')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscard = () => {
    if (
      title !== diary?.title ||
      content !== diary?.content ||
      tags !== diary?.tags?.join(', ')
    ) {
      if (confirm('Are you sure you want to discard your changes?')) {
        push(`/diary/${id}`)
      }
    } else {
      push(`/diary/${id}`)
    }
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Failed to load diary entry
          </p>
          <Link
            href="/diaries"
            className="text-blue-500 hover:text-blue-600 mt-4 inline-block"
          >
            Go back to diaries
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main
      className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
    >
      <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-zinc-700">
          <Link href={`/diary/${id}`}>
            <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-x-1">
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Cancel</span>
            </button>
          </Link>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-white/80 dark:bg-zinc-900/80">
          <div className="max-w-3xl mx-auto">
            {/* Form card */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-zinc-700">
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  {/* Title input */}
                  <div className="mb-4">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                      placeholder="Title..."
                      required
                    />
                  </div>

                  {/* Content editor */}
                  <div className="mb-4">
                    <label
                      htmlFor="content"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Content
                    </label>
                    <div className="rounded-lg border border-gray-300 dark:border-zinc-700 overflow-hidden">
                      <TinyMCEEditor
                        value={content}
                        onEditorChange={(newContent) => setContent(newContent)}
                        height={300}
                      />
                    </div>
                  </div>

                  {/* Bottom row with metadata fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {/* Publicity setting */}
                    <div>
                      <label
                        htmlFor="publicity"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Visibility
                      </label>
                      <select
                        id="publicity"
                        value={publicity}
                        onChange={(e) => setPublicity(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                      >
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                      </select>
                    </div>

                    {/* Tags input */}
                    <div>
                      <label
                        htmlFor="tags"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                        placeholder="life, work, ideas..."
                      />
                    </div>
                  </div>

                  {/* Form actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <button
                      type="button"
                      onClick={handleDiscard}
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors w-full sm:w-auto"
                    >
                      Discard
                    </button>

                    <div className="flex flex-col items-end w-full sm:w-auto">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-x-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                      >
                        <ArrowUpCircleIcon className="h-5 w-5" />
                        <span>{isSaving ? 'Saving...' : 'Save'}</span>
                      </button>

                      {error && (
                        <p className="text-red-500 text-xs mt-2">{error}</p>
                      )}
                      {success && (
                        <p className="text-green-500 text-xs mt-2">
                          Diary updated successfully!
                        </p>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default EditDiary
