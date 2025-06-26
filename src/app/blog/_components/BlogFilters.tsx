'use client'

import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface BlogFiltersProps {
  categories: string[]
}

const BlogFilters = ({ categories }: BlogFiltersProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [featured, setFeatured] = useState(
    searchParams.get('featured') === 'true'
  )

  const updateFilters = useCallback(() => {
    const params = new URLSearchParams()

    if (search) params.set('search', search)
    if (category) params.set('category', category)
    if (featured) params.set('featured', 'true')

    const queryString = params.toString()
    router.push(`/blog${queryString ? `?${queryString}` : ''}`)
  }, [search, category, featured, router])

  const clearFilters = () => {
    setSearch('')
    setCategory('')
    setFeatured(false)
    router.push('/blog')
  }

  useEffect(() => {
    const timeoutId = setTimeout(updateFilters, 500)
    return () => clearTimeout(timeoutId)
  }, [search, category, featured, updateFilters])

  const hasActiveFilters = search || category || featured

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search blogs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Category Filter */}
      <div className="flex items-center space-x-2">
        <FunnelIcon className="w-5 h-5 text-gray-400" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Featured Filter */}
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Featured only
        </span>
      </label>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

export default BlogFilters
