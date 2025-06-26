'use client'

import { IBlog } from '@/models/Blog'
import {
  ChatBubbleLeftIcon,
  EyeIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'

interface BlogListProps {
  blogs: IBlog[]
  currentPage: number
  totalPages: number
  isAdmin: boolean
}

const BlogList = ({
  blogs,
  currentPage,
  totalPages,
  isAdmin
}: BlogListProps) => {
  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 text-lg">
          No blogs found
        </div>
        <p className="text-gray-400 dark:text-gray-500 mt-2">
          Try adjusting your filters or check back later
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <BlogCard key={blog._id} blog={blog} isAdmin={isAdmin} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {currentPage > 1 && (
              <Link
                href={`/blog?page=${currentPage - 1}`}
                className="px-4 py-2 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
              >
                Previous
              </Link>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/blog?page=${page}`}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'
                }`}
              >
                {page}
              </Link>
            ))}

            {currentPage < totalPages && (
              <Link
                href={`/blog?page=${currentPage + 1}`}
                className="px-4 py-2 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface BlogCardProps {
  blog: IBlog
  isAdmin: boolean
}

const BlogCard = ({ blog, isAdmin }: BlogCardProps) => {
  const authorName =
    typeof blog.author === 'string' ? blog.author : blog.author.name

  return (
    <Link href={`/blog/${blog.slug}`}>
      <article className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-zinc-700 overflow-hidden group">
        {/* Cover Image */}
        {blog.coverImage && (
          <div className="aspect-video overflow-hidden">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              width={400}
              height={250}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
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

          {/* Category */}
          <div className="mb-2">
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              {blog.category}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {blog.title}
          </h2>

          {/* Summary */}
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
            {blog.summary}
          </p>

          {/* Meta */}
          <div className="space-y-3">
            {/* Author and Date */}
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                {authorName}
              </span>
              <span className="mx-2">•</span>
              <span className="truncate">
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <EyeIcon className="w-4 h-4" />
                  <span>{blog.views || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  <span>{blog.commentCount || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <HeartIcon className="w-4 h-4" />
                  <span>{blog.likes || 0}</span>
                </div>
              </div>

              {/* Read time if available */}
              {blog.readTime && (
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {blog.readTime} min read
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default BlogList
