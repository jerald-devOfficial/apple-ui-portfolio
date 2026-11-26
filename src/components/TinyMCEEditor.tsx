'use client'

import { useMounted } from '@/hooks/useMounted'
import { useTheme } from 'next-themes'
import dynamic from 'next/dynamic'
import type { Editor as TinyMCEEditorInstance, EditorEvent } from 'tinymce'
import { FC } from 'react'

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
  const mounted = useMounted()
  const currentTheme = theme === 'system' ? resolvedTheme : theme
  const isDark = currentTheme === 'dark'
  const editorKey = `${currentTheme ?? 'system'}-${isDark ? 'dark' : 'light'}`

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
      'help',
      'wordcount',
      'codesample'
    ],
    toolbar:
      'undo redo | blocks | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'table | removeformat | codesample | help',
    contextmenu: 'link table',
    table_toolbar:
      'tableprops tabledelete | ' +
      'tableinsertrowbefore tableinsertrowafter tabledeleterow | ' +
      'tableinsertcolbefore tableinsertcolafter tabledeletecol | ' +
      'tablecellprops tablerowprops | ' +
      'tablecellborderwidth tablecellborderstyle tablecellbordercolor tablecellbackgroundcolor',
    table_class_list: [
      { title: 'Bordered', value: 'blog-table' },
      { title: 'No border class', value: '' }
    ],
    table_border_widths: [
      { title: '1px', value: '1px' },
      { title: '2px', value: '2px' },
      { title: '3px', value: '3px' }
    ],
    table_border_styles: [
      { title: 'Solid', value: 'solid' },
      { title: 'Dashed', value: 'dashed' },
      { title: 'Dotted', value: 'dotted' },
      { title: 'None', value: 'none' }
    ],
    table_border_color_map: [
      { title: 'Light gray', value: isDark ? '4b5563' : 'd1d5db' },
      { title: 'Gray', value: isDark ? '6b7280' : '9ca3af' },
      { title: 'White', value: 'ffffff' },
      { title: 'Black', value: '111827' }
    ],
    table_background_color_map: [
      { title: 'None', value: '' },
      { title: 'Light header', value: isDark ? '1f2937' : 'f9fafb' },
      { title: 'White', value: 'ffffff' },
      { title: 'Light gray', value: isDark ? '374151' : 'f3f4f6' }
    ],
    table_style_by_css: true,
    table_default_styles: {
      'border-collapse': 'collapse',
      width: '100%'
    },
    table_advtab: true,
    table_cell_advtab: true,
    table_row_advtab: true,
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

      table,
      table.blog-table {
        width: 100%;
        border-collapse: collapse;
        margin: 1rem 0;
        border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'};
      }

      th, td {
        border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'};
        padding: 0.5rem 0.75rem;
        text-align: left;
        vertical-align: top;
      }

      th {
        font-weight: 600;
        background-color: ${isDark ? '#1f2937' : '#f9fafb'};
      }
    `,
    setup: (editor: TinyMCEEditorInstance) => {
      editor.on('ExecCommand', (event: EditorEvent<{ command: string }>) => {
        if (event.command !== 'mceInsertTable') return

        window.setTimeout(() => {
          const table = editor.dom.getParent(
            editor.selection.getNode(),
            'table'
          )
          if (!table) return

          editor.dom.addClass(table, 'blog-table')
          editor.dom.setStyles(table, {
            'border-collapse': 'collapse',
            width: '100%'
          })

          editor.dom.select('td,th', table).forEach((cell: Element) => {
            editor.dom.setStyles(cell, {
              border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
              padding: '0.5rem 0.75rem'
            })
          })
        }, 0)
      })
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-75 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
    )
  }

  return (
    <div className={className}>
      <Editor
        key={editorKey}
        value={value}
        onEditorChange={onEditorChange}
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
        init={editorConfig}
      />
    </div>
  )
}

export default TinyMCEEditor
