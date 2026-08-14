'use client'

import { saveBlogAction } from '@/app/blog/actions'
import { initialBlogState } from '@/app/blog/state'
import BlogSaveButton from '@/app/blog/create/_components/BlogSaveButton'
import TinyMCEEditor from '@/components/TinyMCEEditor'
import { ContentBlock, IBlog } from '@/models/Blog'
import {
  ArrowLeftIcon,
  Bars3Icon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useActionState, useState } from 'react'

interface BlogEditorProps {
  blog?: IBlog
}

const BlogEditor = ({ blog }: BlogEditorProps) => {
  const isEditing = !!blog
  const [state, formAction] = useActionState(saveBlogAction, initialBlogState)

  const [title, setTitle] = useState(blog?.title || '')
  const [summary, setSummary] = useState(blog?.summary || '')
  const [category, setCategory] = useState(blog?.category || 'technology')
  const [tags, setTags] = useState(blog?.tags?.join(', ') || '')
  const [status, setStatus] = useState<'draft' | 'published' | 'private'>(
    blog?.status || 'draft'
  )
  const [coverImage, setCoverImage] = useState(blog?.coverImage || '')
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(
    blog?.contentBlocks || []
  )

  const addContentBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `block-${crypto.randomUUID()}`,
      type,
      content: '',
      order: contentBlocks.length,
      metadata: {}
    }
    setContentBlocks([...contentBlocks, newBlock])
  }

  const updateContentBlock = (id: string, updates: Partial<ContentBlock>) => {
    setContentBlocks((blocks) =>
      blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    )
  }

  const removeContentBlock = (id: string) => {
    setContentBlocks((blocks) => {
      const filtered = blocks.filter((block) => block.id !== id)
      // Reorder remaining blocks
      return filtered.map((block, index) => ({ ...block, order: index }))
    })
  }

  const moveBlock = (fromIndex: number, toIndex: number) => {
    setContentBlocks((blocks) => {
      const newBlocks = [...blocks]
      const [movedBlock] = newBlocks.splice(fromIndex, 1)
      newBlocks.splice(toIndex, 0, movedBlock)
      return newBlocks.map((block, index) => ({ ...block, order: index }))
    })
  }

  const derivedContent = contentBlocks
    .filter((block) => block.type === 'text')
    .map((block) => block.content)
    .join('\n\n')

  return (
    <form action={formAction} className="flex flex-col h-full">
      {blog ? <input type="hidden" name="blogId" value={blog._id} /> : null}
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="summary" value={summary} />
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="tags" value={tags} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="coverImage" value={coverImage} />
      <input type="hidden" name="content" value={derivedContent} />
      <input
        type="hidden"
        name="contentBlocks"
        value={JSON.stringify(
          contentBlocks.filter(
            (block) => block.content.trim() || block.metadata?.url
          )
        )}
      />

      <div className="flex justify-between items-center bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md px-6 py-4 border-b border-gray-200 dark:border-zinc-700">
        <Link href="/blog">
          <button
            type="button"
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-x-1"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Blog</span>
          </button>
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Blog' : 'Create New Blog'}
        </h1>
        <div className="flex flex-col items-end">
          <BlogSaveButton isEditing={isEditing} />
          {state.error ? (
            <p className="text-red-500 text-xs mt-1">{state.error}</p>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter blog title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="technology">Technology</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="tutorial">Tutorial</option>
                <option value="news">News</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Summary *
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Enter a brief summary..."
              required
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tag1, tag2, tag3..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Image URL
              </label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'draft' | 'published' | 'private')
                }
                className="w-full p-3 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          {/* Content Blocks */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Content Blocks
              </h2>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => addContentBlock('text')}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                >
                  <PlusIcon className="w-4 h-4 inline mr-1" />
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => addContentBlock('code')}
                  className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                >
                  <PlusIcon className="w-4 h-4 inline mr-1" />
                  Code
                </button>
                <button
                  type="button"
                  onClick={() => addContentBlock('image')}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  <PlusIcon className="w-4 h-4 inline mr-1" />
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => addContentBlock('video')}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  <PlusIcon className="w-4 h-4 inline mr-1" />
                  Video
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {contentBlocks.map((block, index) => (
                <ContentBlockEditor
                  key={block.id}
                  block={block}
                  index={index}
                  onUpdate={(updates) => updateContentBlock(block.id, updates)}
                  onRemove={() => removeContentBlock(block.id)}
                  onMoveUp={
                    index > 0 ? () => moveBlock(index, index - 1) : undefined
                  }
                  onMoveDown={
                    index < contentBlocks.length - 1
                      ? () => moveBlock(index, index + 1)
                      : undefined
                  }
                />
              ))}
            </div>

            {contentBlocks.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">
                  No content blocks yet. Add your first block to get started!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}

interface ContentBlockEditorProps {
  block: ContentBlock
  index: number
  onUpdate: (updates: Partial<ContentBlock>) => void
  onRemove: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}

const ContentBlockEditor = ({
  block,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown
}: ContentBlockEditorProps) => {
  const getBlockIcon = (type: ContentBlock['type']) => {
    switch (type) {
      case 'text':
        return '📝'
      case 'code':
        return '💻'
      case 'image':
        return '🖼️'
      case 'video':
        return '🎥'
      default:
        return '📄'
    }
  }

  const getBlockTitle = (type: ContentBlock['type']) => {
    switch (type) {
      case 'text':
        return 'Text Block'
      case 'code':
        return 'Code Block'
      case 'image':
        return 'Image Block'
      case 'video':
        return 'Video Block'
      default:
        return 'Content Block'
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 p-4">
      {/* Block Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Bars3Icon className="w-5 h-5 text-gray-400 cursor-move" />
          <span className="text-2xl">{getBlockIcon(block.type)}</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {getBlockTitle(block.type)} {index + 1}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ↑
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ↓
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Block Content */}
      <div className="space-y-4">
        {block.type === 'text' && (
          <TinyMCEEditor
            value={block.content}
            onEditorChange={(content) => onUpdate({ content })}
            height={200}
          />
        )}

        {block.type === 'code' && (
          <div className="space-y-3">
            <input
              type="text"
              value={block.metadata?.language || ''}
              onChange={(e) =>
                onUpdate({
                  metadata: { ...block.metadata, language: e.target.value }
                })
              }
              className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              placeholder="Language (e.g., javascript, python, html)"
            />
            <textarea
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-zinc-600 rounded bg-gray-900 dark:bg-zinc-900 text-gray-100 font-mono"
              rows={10}
              placeholder="Enter your code here..."
            />
            <input
              type="text"
              value={block.metadata?.caption || ''}
              onChange={(e) =>
                onUpdate({
                  metadata: { ...block.metadata, caption: e.target.value }
                })
              }
              className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              placeholder="Code caption (optional)"
            />
          </div>
        )}

        {block.type === 'image' && (
          <div className="space-y-3">
            <input
              type="url"
              value={block.metadata?.url || ''}
              onChange={(e) =>
                onUpdate({
                  metadata: { ...block.metadata, url: e.target.value }
                })
              }
              className="w-full p-3 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              placeholder="Image URL"
            />
            <input
              type="text"
              value={block.metadata?.alt || ''}
              onChange={(e) =>
                onUpdate({
                  metadata: { ...block.metadata, alt: e.target.value }
                })
              }
              className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              placeholder="Alt text for accessibility"
            />
            <input
              type="text"
              value={block.metadata?.caption || ''}
              onChange={(e) =>
                onUpdate({
                  metadata: { ...block.metadata, caption: e.target.value }
                })
              }
              className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              placeholder="Image caption (optional)"
            />
          </div>
        )}

        {block.type === 'video' && (
          <div className="space-y-3">
            <input
              type="url"
              value={block.metadata?.url || ''}
              onChange={(e) =>
                onUpdate({
                  metadata: { ...block.metadata, url: e.target.value }
                })
              }
              className="w-full p-3 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              placeholder="Video URL"
            />
            <input
              type="text"
              value={block.metadata?.alt || ''}
              onChange={(e) =>
                onUpdate({
                  metadata: { ...block.metadata, alt: e.target.value }
                })
              }
              className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              placeholder="Poster image URL (optional)"
            />
            <input
              type="text"
              value={block.metadata?.caption || ''}
              onChange={(e) =>
                onUpdate({
                  metadata: { ...block.metadata, caption: e.target.value }
                })
              }
              className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
              placeholder="Video caption (optional)"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogEditor
