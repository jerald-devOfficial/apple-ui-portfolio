'use client'

import { IBlog } from '@/models/Blog'
import {
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  HeartIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useState } from 'react'

interface BlogHeaderProps {
  blog: IBlog
  isAdmin: boolean
}

const BlogHeader = ({ blog, isAdmin }: BlogHeaderProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const authorName =
    typeof blog.author === 'string' ? blog.author : blog.author.name

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog?')) {
      return
    }

    try {
      const response = await fetch(`/api/blog/${blog._id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        window.location.href = '/blog'
      } else {
        alert('Failed to delete blog')
      }
    } catch (error) {
      console.error('Error deleting blog:', error)
      alert('Failed to delete blog')
    }
  }

  return (
    <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-700">
      {/* Mobile Compact Header */}
      <div className="sm:hidden">
        <div className="px-4 py-3">
          <Link href="/blog">
            <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-x-1 mb-2">
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="text-sm">Back to Blog</span>
            </button>
          </Link>

          {/* Compact Title */}
          <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight line-clamp-2">
            {blog.title}
          </h1>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-medium text-xs">
                {blog.category}
              </span>
              <span>•</span>
              <span className="text-xs">{blog.readTime || 3} min read</span>
            </span>
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>

          {/* Expandable Content */}
          {isExpanded && (
            <div className="mt-3 space-y-3">
              {/* Status Badge (Admin only) */}
              {isAdmin && blog.status !== 'published' && (
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      blog.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {blog.status}
                  </span>
                </div>
              )}

              {/* Meta */}
              <div className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
                <span>By {authorName}</span>
                <span>
                  {blog.createdAt
                    ? formatDistanceToNow(
                        new Date(blog.createdAt || Date.now()),
                        {
                          addSuffix: true
                        }
                      )
                    : 'Recently'}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <EyeIcon className="w-3 h-3" />
                  <span>{blog.views || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ChatBubbleLeftIcon className="w-3 h-3" />
                  <span>{blog.commentCount || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <HeartIcon className="w-3 h-3" />
                  <span>{blog.likes || 0}</span>
                </div>
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <Link href={`/blog/${blog.slug}/edit`}>
                    <button className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Summary */}
              {blog.summary && (
                <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {blog.summary}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop/Tablet Header (unchanged) */}
      <div className="hidden sm:block px-6 py-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Link href="/blog">
              <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-x-1 mb-4">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back to Blog</span>
              </button>
            </Link>

            {/* Status Badge (Admin only) */}
            {isAdmin && blog.status !== 'published' && (
              <div className="mb-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    blog.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {blog.status}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {blog.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {blog.category}
              </span>
              <span>•</span>
              <span>By {authorName}</span>
              <span>•</span>
              <span>
                {blog.createdAt
                  ? formatDistanceToNow(
                      new Date(blog.createdAt || Date.now()),
                      {
                        addSuffix: true
                      }
                    )
                  : 'Recently'}
              </span>
              {blog.readTime && (
                <>
                  <span>•</span>
                  <span>{blog.readTime} min read</span>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <EyeIcon className="w-4 h-4" />
                <span>{blog.views || 0} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <ChatBubbleLeftIcon className="w-4 h-4" />
                <span>{blog.commentCount || 0} comments</span>
              </div>
              <div className="flex items-center space-x-1">
                <HeartIcon className="w-4 h-4" />
                <span>{blog.likes || 0} likes</span>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          {isAdmin && (
            <div className="flex items-center space-x-2 ml-4">
              <Link href={`/blog/${blog.slug}/edit`}>
                <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  <PencilIcon className="w-5 h-5" />
                </button>
              </Link>
              <button
                onClick={handleDelete}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Summary */}
        {blog.summary && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              {blog.summary}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogHeader
