'use client'

import { Result } from '@/app/news/_components/News'
import { NEWS_IMAGE_PLACEHOLDER, resolveNewsImage } from '@/lib/news-image'
import { formatDate } from '@/utils'
import Image from 'next/image'
import { useState } from 'react'

type NonFeaturedNewsProps = {
  news: Result
}

const NonFeaturedNews = ({ news }: NonFeaturedNewsProps) => {
  const source = resolveNewsImage(news?.image_url)
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null)
  const img = brokenUrl === source ? NEWS_IMAGE_PLACEHOLDER : source

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={news?.link || '#'}
      className="flex flex-col cursor-pointer bg-white dark:bg-zinc-700 rounded-xl shadow-lg justify-between group"
    >
      <header className="relative rounded-t-[inherit] h-28 sm:h-52 block bg-slate-600">
        <Image
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          src={img}
          loading="lazy"
          fill
          alt={news?.title || 'No title'}
          className="object-cover object-center rounded-[inherit] grayscale group-hover:grayscale-0"
          onError={() => setBrokenUrl(source)}
        />
      </header>
      <div className="flex-1 flex justify-between flex-col">
        <main className="flex flex-col gap-y-1 p-2">
          <h5 className="text-xs sm:text-base text-gray-800 dark:text-gray-300 truncate font-medium">
            {news?.creator ?? 'Author not specified'}
          </h5>
          <h4 className="font-bold text-black dark:text-white text-base sm:text-2xl tracking-tighter">
            {news?.title ?? 'No title'}
          </h4>
        </main>
        <footer className="border-t border-solid border-slate-200 dark:border-zinc-600 px-2 py-1">
          <span className="text-sm text-gray-400 font-medium">
            {formatDate(news?.pubDate ?? new Date())}
          </span>
        </footer>
      </div>
    </a>
  )
}

export default NonFeaturedNews
