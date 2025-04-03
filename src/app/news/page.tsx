'use client'

import FeaturedNews from '@/components/News/FeaturedNews'
import NonFeaturedNews from '@/components/News/NonFeaturedNews'
import { format } from 'date-fns'
import Image from 'next/image'
import { useState } from 'react'
import useSWR, { Fetcher } from 'swr'

export type Result = {
  article_id: string
  title: string
  link: string
  category: string[]
  country: string[]
  description: string | null
  image_url: string | null
  language: string
  pubDate: Date
  creator: string
}

type Data = {
  status: string
  totalResults: number
  results: Result[]
  nextPage: string
}

const News = () => {
  const [currentPage, setCurrentPage] = useState('')
  const [nextPage, setNextPage] = useState('')

  const isValidImageUrl = (url: string): boolean => {
    // Regular expression to match image file extensions
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp)$/i

    // Regular expression to match specific domain or URL patterns to exclude
    const excludedDomains = /cdn\.openpr\.com/i // Example: cdn.openpr.com

    // Check if the URL ends with a valid image file extension
    // and does not come from the excluded domain or URL pattern
    return imageExtensions.test(url) && !excludedDomains.test(url)
  }

  const fetcher: Fetcher<Result[], string> = async (url: string) => {
    if (currentPage !== '') {
      url += `&page=${currentPage}`
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch news. Status: ${response.status}`)
    }

    const data: Data = await response.json()

    // Filter out articles without necessary fields and with invalid image URLs
    const filteredNews = data.results.filter(
      (fetchNews) =>
        fetchNews.title &&
        fetchNews.description &&
        fetchNews.link &&
        fetchNews.image_url && // Check if image_url is not null
        isValidImageUrl(fetchNews.image_url)
    )

    // Filter out duplicates based on description
    const uniqueNews = filteredNews.filter(
      (news, index, self) =>
        index === self.findIndex((t) => t.description === news.description)
    )

    setNextPage(data.nextPage)
    return uniqueNews
  }

  const { data, mutate, error, isLoading } = useSWR(
    `https://newsdata.io/api/1/news?apikey=${process.env.NEXT_PUBLIC_NEWS_DATA_API_KEY}&q=Programming,%20software%20development,%20Technology`,
    fetcher
  )

  const handleNextPage = async () => {
    await setCurrentPage(nextPage)
    mutate()
  }

  return (
    <main
      className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 py-2 sm:py-0`}
    >
      <div className='w-[768px] flex flex-col bg-white/95 flex-1 h-[inherit] panel shadow-xl overflow-hidden relative rounded-xl'>
        <div
          className={`border-b border-[#3C3C43]/36 border-solid px-4 flex gap-x-4 h-[92px] items-end`}
        >
          <div className='flex flex-col items-start justify-start w-full '>
            <div className='flex gap-x-1 items-center'>
              <Image
                src='/images/logo/logo-sm.png'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                alt='News because blog is in progress'
                height={24}
                width={24}
              />
              <h2 className='font-black tracking-tight text-2xl text-black'>
                News
              </h2>
            </div>
            <h2 className='font-black tracking-tight text-2xl text-zinc-500'>
              {format(new Date(), 'MMM d')}
            </h2>
          </div>
        </div>
        {isLoading && (
          <div className='flex items-center flex-col justify-center gap-y-2 grow'>
            <h4 className='text-base font-medium text-slate-600'>
              Fetching news...
            </h4>
          </div>
        )}
        {error && (
          <div className='flex items-center flex-col justify-center gap-y-2 grow'>
            <h4 className='text-base font-medium text-red-600'>
              {error.message}
            </h4>
          </div>
        )}

        {data && (
          <div className='flex flex-col w-full h-full px-4 py-6 bg-white gap-y-10 overflow-y-auto justify-between'>
            <h2 className='font-black text-3xl text-rose-500'>Top Stories</h2>
            <FeaturedNews featured={data[0]} />
            <div className='grid grid-cols-2 gap-4'>
              {data.slice(1).map((item) => (
                <NonFeaturedNews news={item} key={item.article_id} />
              ))}
            </div>

            {/* Pagination */}
            <div className='block'>
              <button
                className='bg-black rounded-xl px-4 py-2 float-right font-semibold text-base hover:underline text-gray-200'
                onClick={handleNextPage}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default News
