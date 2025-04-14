'use client'

import BlogCard from '@/components/BlogCard'
import { IBlog } from '@/models/Blog'
import {
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'
import { Montserrat } from 'next/font/google'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

// Fetch data type for blog listing
interface BlogListResponse {
  blogs: IBlog[]
  filters: {
    categories: string[]
    tags: string[]
  }
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

const Blog = () => {
  const { status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [mounted, setMounted] = useState(false)

  // Use useEffect to update mounted state after component mounts on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Build the API URL with query parameters
  const getApiUrl = () => {
    const url = new URL('/api/blog', window.location.origin)

    if (searchQuery) {
      url.searchParams.append('search', searchQuery)
    }

    if (selectedCategory) {
      url.searchParams.append('category', selectedCategory)
    }

    if (selectedTag) {
      url.searchParams.append('tag', selectedTag)
    }

    url.searchParams.append('page', currentPage.toString())
    url.searchParams.append('limit', '10')

    return url.toString()
  }

  // Fetch blog posts
  const { data, error, isLoading } = useSWR<BlogListResponse>(
    mounted ? getApiUrl() : null, // Only fetch data after component mounts on client
    async (url: string) => {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch blogs')
      }
      return res.json()
    }
  )

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, selectedTag])

  // Initial loading state while mounting
  if (!mounted) {
    return (
      <main
        className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
      >
        <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
          <div className="flex justify-between items-center bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-zinc-700">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Blog
            </h1>
          </div>
          <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-white/80 dark:bg-zinc-900/80">
            <div className="grid place-items-center h-64">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 bg-blue-200 dark:bg-blue-700 rounded-full mb-4"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main
      className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
    >
      <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
        {/* Header with search and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-zinc-700 gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Blog
          </h1>

          <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-3">
            {/* Search bar */}
            <div className="relative w-full sm:w-64 md:w-80">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="search"
                className="block w-full p-2 pl-10 text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Search blog posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters button (for mobile) */}
            <button className="sm:hidden p-2 text-sm rounded-lg flex items-center justify-center border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
              <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
              <span>Filters</span>
            </button>

            {/* Create button - only for authenticated users */}
            {status === 'authenticated' && (
              <Link href="/blog/create">
                <button className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-x-2 hover:bg-blue-600 transition-colors shadow-sm">
                  <PlusIcon className="w-5 h-5" />
                  <span>New Post</span>
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-white/80 dark:bg-zinc-900/80">
          {/* Filters section (desktop) */}
          {data?.filters && (
            <div className="hidden sm:flex mb-6 space-x-2 overflow-x-auto scrollbar-hide pb-2">
              <button
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center transition ${
                  !selectedCategory && !selectedTag
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
                onClick={() => {
                  setSelectedCategory(null)
                  setSelectedTag(null)
                }}
              >
                All Posts
              </button>

              {data.filters.categories.map((category) => (
                <button
                  key={category}
                  className={`px-3 py-1.5 text-sm rounded-lg flex items-center transition ${
                    selectedCategory === category
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  }`}
                  onClick={() => {
                    setSelectedCategory(
                      selectedCategory === category ? null : category
                    )
                    setSelectedTag(null)
                  }}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}

              {data.filters.tags.slice(0, 5).map((tag) => (
                <button
                  key={tag}
                  className={`px-3 py-1.5 text-sm rounded-lg flex items-center transition ${
                    selectedTag === tag
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  }`}
                  onClick={() => {
                    setSelectedTag(selectedTag === tag ? null : tag)
                    setSelectedCategory(null)
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Blog posts grid */}
          {isLoading ? (
            <div className="grid place-items-center h-64">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 bg-blue-200 dark:bg-blue-700 rounded-full mb-4"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">
                Error loading blog posts. Please try again later.
              </p>
            </div>
          ) : !data?.blogs?.length ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-xl p-8 border border-gray-200 dark:border-zinc-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No blog posts found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery || selectedCategory || selectedTag
                  ? `No results match your search criteria. Try adjusting your filters.`
                  : `There are no blog posts yet.`}
              </p>
              {status === 'authenticated' && (
                <Link
                  href="/blog/create"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Write your first post
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Featured posts (first row) */}
              {currentPage === 1 &&
                !searchQuery &&
                !selectedCategory &&
                !selectedTag && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Featured
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
                      {data.blogs
                        .filter((blog) => blog.featured)
                        .slice(0, 2)
                        .map((blog, index) => (
                          <div
                            key={blog._id}
                            className={index === 0 ? 'md:col-span-2' : ''}
                          >
                            <BlogCard blog={blog} featured={index === 0} />
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* Regular blog posts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {(currentPage === 1 &&
                !searchQuery &&
                !selectedCategory &&
                !selectedTag
                  ? data.blogs.filter((blog) => !blog.featured)
                  : data.blogs
                ).map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                    >
                      Previous
                    </button>

                    {Array.from(
                      { length: Math.min(5, data.pagination.totalPages) },
                      (_, i) => {
                        // Logic to show relevant page numbers
                        let pageNum = i + 1
                        if (data.pagination.totalPages > 5) {
                          if (currentPage > 3) {
                            pageNum = currentPage - 3 + i
                          }
                          if (pageNum > data.pagination.totalPages - 2) {
                            pageNum = data.pagination.totalPages - 4 + i
                          }
                        }
                        return (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center rounded-md ${
                              currentPage === pageNum
                                ? 'bg-blue-500 text-white'
                                : 'border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      }
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, data.pagination.totalPages)
                        )
                      }
                      disabled={currentPage === data.pagination.totalPages}
                      className="px-3 py-1 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default Blog
