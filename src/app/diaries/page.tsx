'use client'

import { IDiary } from '@/models/Diary'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'
import { Montserrat } from 'next/font/google'
import Link from 'next/link'
import useSWR, { Fetcher } from 'swr'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

const Diaries = () => {
  const { status } = useSession()
  const fetcher: Fetcher<IDiary[], string> = (url) =>
    fetch(url).then((res) => res.json())

  const { data } = useSWR('/api/diary', fetcher)

  console.log('data: ', data)

  return (
    <main
      className={`flex overflow-hidden h-full flex-col w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
    >
      <div className="flex justify-between items-center w-full">
        <h1 className={`${montserrat.className} text-2xl font-bold`}>
          Diaries
        </h1>
        {status === 'authenticated' && (
          <Link href="/diary">
            <button className="bg-blue-500 text-white px-4 py-1 rounded-md flex items-center gap-x-2">
              Create <PlusIcon className="w-4 h-4" />
            </button>
          </Link>
        )}
      </div>
      {data &&
        data.map((diary: IDiary) => <div key={diary._id}>{diary.title}</div>)}
    </main>
  )
}

export default Diaries
