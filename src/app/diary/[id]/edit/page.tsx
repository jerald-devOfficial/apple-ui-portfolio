'use client'

import { ArrowLeftIcon, ArrowUpCircleIcon } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { Montserrat } from 'next/font/google'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import useSWR from 'swr'

// Dynamically import TinyMCE Editor
const Editor = dynamic(
  () => import('@tinymce/tinymce-react').then(({ Editor }) => Editor),
  { ssr: false, loading: () => <p>Loading editor...</p> }
)

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

const DiaryEdit = () => {
  const { id } = useParams()
  const { status } = useSession()
  const { push } = useRouter()
  const editorRef = useRef(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [publicity, setPublicity] = useState('private')
  const [tags, setTags] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Use SWR for data fetching
  const fetcher = (url: string) => fetch(url).then((res) => res.json())
  const {
    data: diary,
    error,
    isLoading,
    mutate
  } = useSWR(status === 'authenticated' ? `/api/diary/${id}` : null, fetcher)

  // Initialize form fields when diary data is loaded
  useEffect(() => {
    if (diary && !isLoading) {
      if (!title) setTitle(diary.title)
      if (!content) setContent(diary.content)
      if (publicity === 'private')
        setPublicity(diary.publicity ? 'public' : 'private')
      if (!tags) setTags(diary.tags?.join(', ') || '')
    }
  }, [diary, isLoading, title, content, publicity, tags])

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    push('/diaries')
    return null
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Create update object only with changed fields
      const updateData: {
        title?: string
        content?: string
        publicity?: boolean
        tags?: string[]
      } = {}

      if (title !== diary.title) updateData.title = title
      if (content !== diary.content) updateData.content = content
      if ((publicity === 'public') !== diary.publicity)
        updateData.publicity = publicity === 'public'

      const currentTags = diary.tags?.join(', ') || ''
      if (tags !== currentTags) {
        updateData.tags = tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      }

      // Only send request if there are changes
      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save')
        setIsSaving(false)
        return
      }

      const res = await fetch(`/api/diary/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ update: updateData })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.msg || 'Failed to update diary entry')
      }

      toast.success('Diary updated successfully!')

      // Update the SWR cache
      mutate()

      // Redirect after successful update
      setTimeout(() => {
        push(`/diary/${id}`)
      }, 1500)
    } catch (err) {
      console.error('Error updating diary:', err)
      toast.error(
        err instanceof Error ? err.message : 'Failed to update diary entry'
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main
        className={`flex h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
      >
        <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-10 w-10 bg-blue-200 dark:bg-blue-700 rounded-full mb-4"></div>
            <div className="h-4 w-40 bg-gray-200 dark:bg-zinc-700 rounded mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded"></div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main
        className={`flex h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
      >
        <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-600 mb-2">
              Error loading diary
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {error.message}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
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
              Editing Entry
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-white/80 dark:bg-zinc-900/80">
            <div className="max-w-3xl mx-auto">
              {/* Edit form */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-zinc-700">
                <form onSubmit={handleSubmit} className="p-6">
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
                      <Editor
                        onInit={(_, editor) => {
                          editorRef.current = editor
                        }}
                        value={content}
                        onEditorChange={(newContent) => setContent(newContent)}
                        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                        init={{
                          height: 300,
                          menubar: false,
                          skin: 'oxide-dark',
                          content_css: 'dark',
                          plugins: [
                            'advlist',
                            'autolink',
                            'lists',
                            'link',
                            'image',
                            'charmap',
                            'preview',
                            'anchor',
                            'searchreplace',
                            'visualblocks',
                            'code',
                            'fullscreen',
                            'insertdatetime',
                            'media',
                            'table',
                            'code',
                            'help',
                            'wordcount',
                            'codesample'
                          ],
                          toolbar:
                            'undo redo | blocks | ' +
                            'bold italic forecolor | alignleft aligncenter ' +
                            'alignright alignjustify | bullist numlist outdent indent | ' +
                            'removeformat | codesample | help',
                          content_style: `
                            body {
                              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                              font-size: 16px;
                              line-height: 1.6;
                              padding: 1rem;
                              background-color: #1e1e1e;
                              color: #f3f3f3;
                            }
                          `
                        }}
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

                  {/* Submit button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-x-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <ArrowUpCircleIcon className="h-5 w-5" />
                      <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default DiaryEdit
