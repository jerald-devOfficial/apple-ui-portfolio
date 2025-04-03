'use client'

import { ArrowLeftIcon, ArrowUpCircleIcon } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { Montserrat } from 'next/font/google'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

// Dynamically import TinyMCE Editor
const Editor = dynamic(
  () => import('@tinymce/tinymce-react').then(({ Editor }) => Editor),
  { ssr: false, loading: () => <p>Loading editor...</p> }
)

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

const Diary = () => {
  const { status } = useSession()
  const { push } = useRouter()
  const editorRef = useRef(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [publicity, setPublicity] = useState('private')
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editorConfig, setEditorConfig] = useState({
    height: 300,
    menubar: false,
    skin: 'oxide',
    content_css: 'default',
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
      'codesample',
      'quickbars'
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
        padding: 0;
        margin: 0;
      }
      p {
        margin: 0 0 1em 0;
      }
      code {
        font-family: SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        background-color: rgba(0, 0, 0, 0.05);
        padding: .1em .2em;
        border-radius: 3px;
      }
      .mce-content-body:focus {
        outline: none;
      }
    `,
    placeholder: 'Write your thoughts here...'
  })

  useEffect(() => {
    if (status !== 'authenticated') {
      push('/diaries')
    }
  }, [status, push])

  // Update editor config based on color scheme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDarkMode =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches

      setEditorConfig((prev) => ({
        ...prev,
        skin: isDarkMode ? 'oxide-dark' : 'oxide',
        content_css: isDarkMode ? 'dark' : 'default',
        content_style: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            padding: 0;
            margin: 0;
            ${isDarkMode ? 'background-color: #1e1e1e; color: #f3f3f3;' : ''}
          }
          p {
            margin: 0 0 1em 0;
          }
          code {
            font-family: SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            background-color: ${
              isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
            };
            padding: .1em .2em;
            border-radius: 3px;
          }
          .mce-content-body:focus {
            outline: none;
          }
        `
      }))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess(false)

    console.log('Submitting new diary entry...')

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

      const res = await fetch('/api/diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      // Debug logging
      console.log('API Response:', { status: res.status, data })

      if (res.ok) {
        setTitle('')
        setContent('')
        setPublicity('private')
        setTags('')
        setSuccess(true)
        setError('')

        console.log('Diary saved successfully, redirecting in 1.5 seconds...')

        // Redirect to diaries list after successful creation
        setTimeout(() => {
          push('/diaries')
        }, 1500)
      } else {
        console.error(
          'Failed to save diary entry:',
          data.msg || 'Unknown error'
        )
        setError(data.msg || 'Failed to save diary entry')
        setSuccess(false)
      }
    } catch (err) {
      console.error('Error saving diary:', err)
      setError('An error occurred while saving your diary entry')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscard = () => {
    if (title || content || tags) {
      if (confirm('Are you sure you want to discard this diary entry?')) {
        push('/diaries')
      }
    } else {
      push('/diaries')
    }
  }

  return (
    <main
      className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
    >
      <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-zinc-700">
          <Link href="/diaries">
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
                      <Editor
                        onInit={(_, editor) => {
                          editorRef.current = editor
                        }}
                        value={content}
                        onEditorChange={(newContent) => setContent(newContent)}
                        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                        init={editorConfig}
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
                          Diary saved successfully!
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

export default Diary
