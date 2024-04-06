'use client'

import Image from 'next/image'
import useSWR, { Fetcher } from 'swr'
import React, { useState } from 'react'
import { formatDate } from '@/utils'
import { format } from 'date-fns'

const News = () => {
  const [currentPage, setCurrentPage] = useState('')
  const [nextPage, setNextPage] = useState('')

  type Results = {
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
    results: Results[]
    nextPage: string
  }

  const isValidImageUrl = (url: string): boolean => {
    // Regular expression to match image file extensions
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp)$/i

    // Regular expression to match specific domain or URL patterns to exclude
    const excludedDomains = /cdn\.openpr\.com/i // Example: cdn.openpr.com

    // Check if the URL ends with a valid image file extension
    // and does not come from the excluded domain or URL pattern
    return imageExtensions.test(url) && !excludedDomains.test(url)
  }

  const fetcher: Fetcher<Results[], any> = async (url: string) => {
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
          <div className='flex items-center flex-col justify-center gap-y-2 flex-grow'>
            <h4 className='text-base font-medium text-slate-600'>
              Fetching news...
            </h4>
          </div>
        )}
        {error && (
          <div className='flex items-center flex-col justify-center gap-y-2 flex-grow'>
            <h4 className='text-base font-medium text-red-600'>
              {error.message}
            </h4>
          </div>
        )}

        {data && (
          <div className='flex flex-col w-full h-full px-4 py-6 bg-white gap-y-10 overflow-y-auto justify-between'>
            <h2 className='font-black text-3xl text-rose-500'>Top Stories</h2>
            <a
              target='_blank'
              rel='noopener noreferrer'
              href={data[0].link}
              className='flex flex-col bg-white rounded-xl shadow-lg group cursor-pointer hover:bg-gray-200'
            >
              <header className='relative rounded-t-[inherit] bg-slate-600'>
                <Image
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  src={data[0].image_url!}
                  width={1}
                  height={1}
                  loading='lazy'
                  style={{
                    height: 'auto',
                    width: '100%'
                  }}
                  alt={data[0].title}
                  className='object-cover object-center rounded-[inherit]'
                />
              </header>
              <main className='flex flex-col gap-y-1 p-2'>
                <h5 className='text-base text-gray-800 truncate font-medium'>
                  {data[0].creator}
                </h5>
                <h4 className='font-bold text-black text-2xl tracking-tighter'>
                  {data[0].title}
                </h4>
              </main>
              <footer className='border-t border-solid border-slate-200 group-hover:border-gray-100 px-2 py-1'>
                <span className='text-sm text-gray-400 font-medium'>
                  {formatDate(data[0].pubDate)}
                </span>
              </footer>
            </a>
            <div className='grid grid-cols-2 gap-4'>
              {data.slice(1).map((item) => (
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  href={item.link}
                  key={item.article_id}
                  className='flex flex-col cursor-pointer bg-white rounded-xl shadow-lg justify-between group'
                >
                  <header className='relative rounded-t-[inherit] h-28 sm:h-52 block bg-slate-600'>
                    <Image
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                      src={item.image_url!}
                      loading='lazy'
                      fill
                      alt={item.title}
                      className='object-cover object-center rounded-[inherit] grayscale group-hover:grayscale-0'
                    />
                  </header>
                  <div className='flex-1 flex justify-between flex-col'>
                    <main className='flex flex-col gap-y-1 p-2'>
                      <h5 className='text-xs sm:text-base text-gray-800 truncate font-medium'>
                        {item.creator ?? 'Author not specified'}
                      </h5>
                      <h4 className='font-bold text-black text-base sm:text-2xl tracking-tighter'>
                        {item.title}
                      </h4>
                    </main>
                    <footer className='border-t border-solid border-slate-200 px-2 py-1'>
                      <span className='text-sm text-gray-400 font-medium'>
                        {formatDate(item.pubDate)}
                      </span>
                    </footer>
                  </div>
                </a>
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
