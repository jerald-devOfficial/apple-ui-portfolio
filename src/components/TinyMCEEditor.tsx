'use client'

import { useTheme } from 'next-themes'
import dynamic from 'next/dynamic'
import { FC, useEffect, useState } from 'react'

// Dynamically import TinyMCE Editor
const Editor = dynamic(
  () => import('@tinymce/tinymce-react').then(({ Editor }) => Editor),
  { ssr: false, loading: () => <p>Loading editor...</p> }
)

interface TinyMCEEditorProps {
  value: string
  onEditorChange: (content: string) => void
  className?: string
  height?: number
}

const TinyMCEEditor: FC<TinyMCEEditorProps> = ({
  value,
  onEditorChange,
  className = '',
  height = 300
}) => {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [key, setKey] = useState(0) // Add key for forcing remount

  // Handle mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Force editor remount when theme changes
  useEffect(() => {
    if (!mounted) return
    setKey((prev) => prev + 1)
  }, [theme, resolvedTheme, mounted])

  const currentTheme = theme === 'system' ? resolvedTheme : theme
  const isDark = currentTheme === 'dark'

  const editorConfig = {
    height,
    menubar: false,
    skin: isDark ? 'oxide-dark' : 'oxide',
    content_css: isDark ? 'dark' : 'default',
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
        ${isDark ? 'background-color: #1e1e1e; color: #f3f3f3;' : ''}
      }
      
      .mce-content-body {
        background-color: ${isDark ? '#1e1e1e' : '#ffffff'};
        color: ${isDark ? '#f3f3f3' : '#000000'};
      }
      
      .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
        color: ${isDark ? '#6b7280' : '#9ca3af'};
      }
      
      code {
        background-color: ${isDark ? '#374151' : '#f3f4f6'};
        padding: 0.2em 0.4em;
        border-radius: 0.25em;
      }
    `
  }

  if (!mounted) {
    return (
      <div className="min-h-[300px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
    )
  }

  return (
    <div className={className}>
      <Editor
        key={key} // Add key to force remount
        value={value}
        onEditorChange={onEditorChange}
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
        init={editorConfig}
      />
    </div>
  )
}

export default TinyMCEEditor
