import { Result } from '@/app/news/page'
import { formatDate } from '@/utils'
import Image from 'next/image'
import { useState } from 'react'

type NonFeaturedNewsProps = {
  news: Result
}

const NonFeaturedNews = ({ news }: NonFeaturedNewsProps) => {
  const [img, setImg] = useState(news.image_url!)
  return (
    <a
      target='_blank'
      rel='noopener noreferrer'
      href={news.link}
      className='flex flex-col cursor-pointer bg-white rounded-xl shadow-lg justify-between group'
    >
      <header className='relative rounded-t-[inherit] h-28 sm:h-52 block bg-slate-600'>
        <Image
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          src={img}
          loading='lazy'
          fill
          alt={news.title}
          className='object-cover object-center rounded-[inherit] grayscale group-hover:grayscale-0'
          onError={() =>
            setImg(
              `https://placehold.co/600x400/000000/FFFFFF.png?text=No+Image`
            )
          }
        />
      </header>
      <div className='flex-1 flex justify-between flex-col'>
        <main className='flex flex-col gap-y-1 p-2'>
          <h5 className='text-xs sm:text-base text-gray-800 truncate font-medium'>
            {news.creator ?? 'Author not specified'}
          </h5>
          <h4 className='font-bold text-black text-base sm:text-2xl tracking-tighter'>
            {news.title}
          </h4>
        </main>
        <footer className='border-t border-solid border-slate-200 px-2 py-1'>
          <span className='text-sm text-gray-400 font-medium'>
            {formatDate(news.pubDate)}
          </span>
        </footer>
      </div>
    </a>
  )
}

export default NonFeaturedNews
