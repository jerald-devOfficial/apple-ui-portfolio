'use client'

import { ContentBlock, IBlog } from '@/models/Blog'
import DOMPurify from 'isomorphic-dompurify'
import Image from 'next/image'

interface BlogContentProps {
  blog: IBlog
}

const BlogContent = ({ blog }: BlogContentProps) => {
  // Sort content blocks by order
  const sortedBlocks =
    blog.contentBlocks?.sort((a, b) => a.order - b.order) || []

  // If no content blocks, fall back to legacy content
  if (sortedBlocks.length === 0 && blog.content) {
    return (
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(blog.content)
          }}
        />
      </div>
    )
  }

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {sortedBlocks.map((block) => (
        <ContentBlockRenderer key={block.id} block={block} />
      ))}
    </div>
  )
}

interface ContentBlockRendererProps {
  block: ContentBlock
}

const ContentBlockRenderer = ({ block }: ContentBlockRendererProps) => {
  switch (block.type) {
    case 'text':
      return (
        <div
          className="mb-6"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(block.content)
          }}
        />
      )

    case 'code':
      return (
        <div className="mb-6">
          <div className="bg-gray-900 dark:bg-zinc-800 rounded-lg overflow-hidden">
            {block.metadata?.language && (
              <div className="bg-gray-800 dark:bg-zinc-700 px-4 py-2 text-sm text-gray-300 border-b border-gray-700 dark:border-zinc-600">
                {block.metadata.language}
              </div>
            )}
            <pre className="p-4 overflow-x-auto">
              <code
                className={`language-${block.metadata?.language || 'text'}`}
              >
                {block.content}
              </code>
            </pre>
          </div>
          {block.metadata?.caption && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
              {block.metadata.caption}
            </p>
          )}
        </div>
      )

    case 'image':
      return (
        <div className="mb-6">
          <div className="relative">
            <Image
              src={block.metadata?.url || block.content}
              alt={block.metadata?.alt || 'Blog image'}
              width={800}
              height={600}
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
          {block.metadata?.caption && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center italic">
              {block.metadata.caption}
            </p>
          )}
        </div>
      )

    case 'video':
      return (
        <div className="mb-6">
          <div className="relative aspect-video">
            <video
              src={block.metadata?.url || block.content}
              controls
              className="w-full h-full rounded-lg shadow-md"
              poster={block.metadata?.alt}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          {block.metadata?.caption && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center italic">
              {block.metadata.caption}
            </p>
          )}
        </div>
      )

    default:
      return null
  }
}

export default BlogContent
