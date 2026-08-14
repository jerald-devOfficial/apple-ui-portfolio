'use client'

import DiaryCard from '@/components/DiaryCard'
import EmptyDiaryState from '@/components/EmptyDiaryState'
import { fetcher } from '@/lib/fetcher'
import { IDiary } from '@/models/Diary'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import useSWR from 'swr'

interface DiaryApiResponse {
  diaries: IDiary[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

type DiariesProps = {
  isAuthenticated: boolean
  viewerEmail?: string
}

const Diaries = ({ isAuthenticated, viewerEmail }: DiariesProps) => {
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, error } = useSWR<DiaryApiResponse>(
    '/api/diary',
    fetcher,
    { revalidateOnFocus: true }
  )

  const filteredDiaries = data?.diaries?.filter(
    (diary) =>
      diary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      diary.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

  return (
    <>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-800/90">
        <div className="relative w-full sm:w-64 md:w-80 sm:ml-auto">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            className="block w-full p-2 pl-10 text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Search entries or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grow overflow-y-auto p-4 sm:p-6 bg-white/80 dark:bg-zinc-900/80">
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
              Error loading diaries. Please try again later.
            </p>
          </div>
        ) : filteredDiaries?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDiaries.map((diary) => (
              <DiaryCard
                key={diary._id}
                diary={diary}
                isOwner={
                  isAuthenticated && viewerEmail === diary.userId?.toLowerCase()
                }
              />
            ))}
          </div>
        ) : data?.diaries?.length ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No entries match your search. Try a different query.
            </p>
          </div>
        ) : (
          <EmptyDiaryState isAuthenticated={isAuthenticated} />
        )}
      </div>
    </>
  )
}

export default Diaries
