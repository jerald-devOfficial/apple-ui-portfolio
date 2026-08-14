'use client'

import { IDiary } from '@/models/Diary'
import { Editor } from '@tinymce/tinymce-react'
import { useTheme } from 'next-themes'

const DiaryView = ({ diary }: { diary: IDiary }) => {
  const { resolvedTheme } = useTheme()

  return (
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
          skin: resolvedTheme === 'dark' ? 'oxide-dark' : 'oxide',
          content_css: resolvedTheme === 'dark' ? 'dark' : 'default',
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
              `
        }}
      />
    </div>
  )
}

export default DiaryView
