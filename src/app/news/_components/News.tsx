'use client'

import FeaturedNews from '@/components/News/FeaturedNews'
import NonFeaturedNews from '@/components/News/NonFeaturedNews'
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

const NEWS_BASE_URL = `https://newsdata.io/api/1/news?apikey=${process.env.NEXT_PUBLIC_NEWS_DATA_API_KEY}&q=Programming,%20software%20development,%20Technology`

const buildNewsUrl = (page: string) =>
  page ? `${NEWS_BASE_URL}&page=${page}` : NEWS_BASE_URL

const News = () => {
  const [currentPage, setCurrentPage] = useState('')
  const [nextPage, setNextPage] = useState('')

  const isValidImageUrl = (url: string): boolean => {
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp)$/i
    const excludedDomains = /cdn\.openpr\.com/i

    return imageExtensions.test(url) && !excludedDomains.test(url)
  }

  const fetcher: Fetcher<Result[], string> = async (url: string) => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch news. Status: ${response.status}`)
    }

    const data: Data = await response.json()

    const filteredNews = data.results.filter(
      (fetchNews) =>
        fetchNews.title &&
        fetchNews.description &&
        fetchNews.link &&
        fetchNews.image_url &&
        isValidImageUrl(fetchNews.image_url)
    )

    const uniqueNews = filteredNews.filter(
      (news, index, self) =>
        index === self.findIndex((t) => t.description === news.description)
    )

    setNextPage(data.nextPage)
    return uniqueNews
  }

  const { data, error, isLoading } = useSWR(buildNewsUrl(currentPage), fetcher)

  const handleNextPage = () => {
    setCurrentPage(nextPage)
  }

  if (isLoading) {
    return (
      <div className="flex items-center flex-col justify-center gap-y-2 grow">
        <h4 className="text-base font-medium text-slate-600 dark:text-gray-400">
          Fetching news...
        </h4>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center flex-col justify-center gap-y-2 grow">
        <h4 className="text-base font-medium text-red-600">{error.message}</h4>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex flex-col w-full h-full px-4 py-6 bg-white dark:bg-zinc-800 gap-y-10 overflow-y-auto justify-between">
      <h2 className="font-black text-3xl text-rose-500">Top Stories</h2>
      <FeaturedNews featured={data[0]} />
      <div className="grid grid-cols-2 gap-4">
        {data.slice(1).map((item) => (
          <NonFeaturedNews news={item} key={item.article_id} />
        ))}
      </div>

      <div className="block">
        <button
          type="button"
          className="bg-black rounded-xl px-4 py-2 float-right font-semibold text-base hover:underline text-gray-200"
          onClick={handleNextPage}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default News
