import { Author, IBlog } from '@/models/Blog'
import { formatDate } from '@/utils'
import {
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import { FC } from 'react'

interface BlogCardProps {
  blog: IBlog
  featured?: boolean
}

const BlogCard: FC<BlogCardProps> = ({ blog, featured = false }) => {
  // Helper function to handle Date objects and convert them to strings
  const formatBlogDate = (date?: Date) => {
    if (!date) return 'Recent'
    try {
      // Convert Date object to ISO string for the utils formatDate function
      return formatDate(date instanceof Date ? date : new Date(date))
    } catch {
      return 'Recent'
    }
  }

  // Helper to get author name
  const getAuthorName = (author: string | Author): string => {
    if (typeof author === 'string') return author
    return author.name || 'Unknown'
  }

  return (
    <Link href={`/blog/${blog.slug}`} className="h-full">
      <div
        className={`group h-full flex flex-col rounded-xl overflow-hidden bg-white dark:bg-zinc-800 shadow-sm border border-gray-200 dark:border-zinc-700 hover:shadow-md transition duration-300 ${
          featured ? 'featured-card' : ''
        }`}
      >
        {/* Image Container */}
        {blog.coverImage && (
          <div className="relative w-full aspect-video overflow-hidden">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {featured && (
              <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded">
                Featured
              </div>
            )}
            {blog.category && (
              <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded">
                {blog.category}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col flex-grow p-5">
          {/* Title */}
          <h3
            className={`font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors ${
              featured ? 'text-xl' : 'text-lg'
            }`}
          >
            {blog.title}
          </h3>

          {/* Author and date */}
          <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {formatBlogDate(blog.publishedAt || blog.createdAt)}
            </span>
            <span className="mx-2">•</span>
            <span>{getAuthorName(blog.author)}</span>
          </div>

          {/* Summary */}
          <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm flex-grow line-clamp-3">
            {blog.summary}
          </p>

          {/* Footer with meta info */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <div className="flex space-x-4">
              <span className="flex items-center">
                <EyeIcon className="h-4 w-4 mr-1" />
                {blog.views}
              </span>
              <span className="flex items-center">
                <HeartIcon className="h-4 w-4 mr-1" />
                {blog.likes}
              </span>
              <span className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {blog.readTime || 3} min read
              </span>
            </div>

            {/* Tags (show only first tag in card) */}
            {blog.tags && blog.tags.length > 0 && (
              <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300">
                {blog.tags[0]}
                {blog.tags.length > 1 && `+${blog.tags.length - 1}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default BlogCard
