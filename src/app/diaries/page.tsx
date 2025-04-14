'use client'

import DiaryCard from '@/components/DiaryCard'
import EmptyDiaryState from '@/components/EmptyDiaryState'
import { IDiary } from '@/models/Diary'
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'
import { Montserrat } from 'next/font/google'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import useSWR, { Fetcher } from 'swr'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

// Define the API response type
interface DiaryApiResponse {
  diaries: IDiary[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  testData?: boolean
}

const Diaries = () => {
  const { status, data: sessionData } = useSession()
  const [searchQuery, setSearchQuery] = useState('')

  console.log('Session status:', status)

  // Simple fetcher like in the mails component
  const fetcher: Fetcher<DiaryApiResponse, string> = (url) =>
    fetch(url)
      .then((res) => {
        console.log(`API response status: ${res.status}`)
        if (!res.ok) {
          throw new Error(`API error with status ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        console.log('Received data:', {
          diariesCount: data.diaries?.length || 0,
          firstDiaryTitle: data.diaries?.[0]?.title || 'No diaries'
        })
        return data
      })
      .catch((err) => {
        console.error('Fetch error:', err)
        throw err
      })

  const { data, isLoading, error, mutate } = useSWR('/api/diary', fetcher, {
    revalidateOnFocus: true
  })

  console.log('Diaries data details:', {
    loading: isLoading,
    error: error ? String(error) : null,
    diaryCount: data?.diaries?.length || 0,
    testData: data?.testData || false
  })

  // Force a refetch when auth status changes
  useEffect(() => {
    console.log('Auth status changed to:', status)
    mutate()
  }, [status, mutate])

  // Define authentication state early
  const isAuthenticated = status === 'authenticated'

  // Test direct API access
  useEffect(() => {
    const testApiAccess = async () => {
      try {
        const response = await fetch('/api/diary')
        const data = await response.json()
        console.log('Direct API test result:', {
          status: response.status,
          diariesCount: data.diaries?.length || 0
        })
      } catch (e) {
        console.error('Direct API test failed:', e)
      }
    }

    testApiAccess()
  }, [])

  // Filter diaries based on search query and privacy
  const filteredDiaries = data?.diaries?.filter((diary) => {
    // STRICT PRIVACY FILTER: If user is not authenticated, only show public diaries
    if (!isAuthenticated && !diary.publicity) {
      console.log(
        `Filtered out private diary: ${diary.title} (ID: ${diary._id})`
      )
      return false
    }

    // For authenticated users, filter based on search
    return (
      diary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      diary.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  })

  console.log(
    `Total diaries: ${data?.diaries?.length || 0}, After filtering: ${
      filteredDiaries?.length || 0
    }`
  )

  return (
    <main
      className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
    >
      <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
        {/* Header with search and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-zinc-700 gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Diaries
            {!isAuthenticated && (
              <span className="text-sm ml-2 text-gray-500 dark:text-gray-400 font-normal">
                (Public)
              </span>
            )}
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
                placeholder="Search entries or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Create button - only for authenticated users */}
            {isAuthenticated && (
              <Link href="/diary">
                <button className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-x-2 hover:bg-blue-600 transition-colors shadow-sm">
                  <PlusIcon className="w-5 h-5" />
                  <span>New Entry</span>
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-white/80 dark:bg-zinc-900/80">
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
                    isAuthenticated && sessionData?.user?.email === diary.userId
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
      </div>
    </main>
  )
}

export default Diaries
