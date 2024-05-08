'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { ArrowUpCircleIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// Dynamically import React Quill
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading...</p>
})

// Include the styles for React Quill
import 'react-quill/dist/quill.snow.css'
import { formatDiaryDate } from '@/utils'

const Diary = () => {
  const { status } = useSession()

  const session = useSession()

  console.log(session)

  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [createdAt] = useState(new Date())

  if (status === 'unauthenticated') {
    router.push('/')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const res = await fetch('/api/diary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        content
      })
    })

    const data = await res.json()

    if (res.ok) {
      setTitle('')
      setContent('')
      setSuccess(true)
      setError('')
    } else {
      setError(data.msg || 'Failed to save diary entry')
      setSuccess(false)
    }
  }

  return (
    <main className='flex flex-col items-center justify-center p-4'>
      <div className='w-full max-w-xl bg-white shadow-md rounded-lg p-6'>
        <div className='text-gray-600 text-sm mb-2'>
          <span>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          <span className='float-right'>
            Saved at: {formatDiaryDate(createdAt)}
          </span>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type='text'
            id='title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='w-full p-2 mb-4 border-b border-gray-300 focus:outline-none'
            placeholder='Title...'
            required
          />
          <ReactQuill
            theme='snow'
            value={content}
            onChange={setContent}
            modules={Diary.modules}
            formats={Diary.formats}
            placeholder='Write your thoughts here...'
          />
          <div className='flex justify-between items-center mt-4'>
            <button type='button' className='text-gray-500 hover:text-gray-700'>
              Discard
            </button>
            <button
              type='submit'
              className='text-blue-600 hover:text-blue-800 flex items-center'
            >
              <ArrowUpCircleIcon className='h-5 w-5 mr-2' />
              Done
            </button>
          </div>
          {error && <p className='text-red-500 text-xs mt-2'>{error}</p>}
          {success && (
            <p className='text-green-500 text-xs mt-2'>
              Diary saved successfully!
            </p>
          )}
        </form>
      </div>
    </main>
  )
}

// Specify the formats and modules for React Quill
Diary.modules = {
  toolbar: [
    [{ header: '1' }, { header: '2' }, { font: [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [
      { list: 'ordered' },
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' }
    ],
    ['link', 'image', 'code-block'],
    ['clean']
  ],
  clipboard: {
    // Match visual, not semantic
    matchVisual: false
  }
}

Diary.formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'code-block'
]

export default Diary
