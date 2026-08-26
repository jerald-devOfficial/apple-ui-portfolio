'use client'

import { Result } from '@/app/news/_components/News'
import { NEWS_IMAGE_PLACEHOLDER, resolveNewsImage } from '@/lib/news-image'
import { formatDate } from '@/utils'
import Image from 'next/image'
import { useState } from 'react'

type FeaturedNewsProps = {
  featured: Result
}

const FeaturedNews = ({ featured }: FeaturedNewsProps) => {
  const source = resolveNewsImage(featured?.image_url)
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null)
  const featuredImg = brokenUrl === source ? NEWS_IMAGE_PLACEHOLDER : source

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={featured?.link || '#'}
      className="flex flex-col bg-white dark:bg-zinc-700 rounded-xl shadow-lg group cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-600"
    >
      <header className="relative rounded-t-[inherit] bg-slate-600">
        <Image
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          src={featuredImg}
          width={1}
          height={1}
          // The featured story is the hero image at the top of /news, so it is
          // the LCP element — lazy loading it delays the metric.
          priority
          style={{
            height: 'auto',
            width: '100%'
          }}
          alt={featured?.title || 'No title'}
          className="object-cover object-center rounded-[inherit]"
          onError={() => setBrokenUrl(source)}
        />
      </header>
      <main className="flex flex-col gap-y-1 p-2">
        <h5 className="text-base text-gray-800 dark:text-gray-300 truncate font-medium">
          {featured?.creator || 'Unknown Creator'}
        </h5>
        <h4 className="font-bold text-black dark:text-white text-2xl tracking-tighter">
          {featured?.title || 'No Title'}
        </h4>
      </main>
      <footer className="border-t border-solid border-slate-200 dark:border-zinc-600 group-hover:border-gray-100 dark:group-hover:border-zinc-500 px-2 py-1">
        <span className="text-sm text-gray-400 font-medium">
          {formatDate(featured?.pubDate || new Date())}
        </span>
      </footer>
    </a>
  )
}

export default FeaturedNews
