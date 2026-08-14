import News from '@/app/news/_components/News'
import { format } from 'date-fns'
import Image from 'next/image'

const NewsPage = () => (
  <main className="flex overflow-hidden h-full w-full xl:max-w-5xl sm:pt-6 xl:pt-12 lg:max-w-231 mx-auto sm:px-12 lg:px-0 py-2 sm:py-0">
    <div className="w-3xl flex flex-col bg-white/95 dark:bg-zinc-900 flex-1 h-[inherit] panel shadow-xl overflow-hidden rounded-xl">
      <div className="border-b border-[#3C3C43]/36 dark:border-zinc-700 border-solid px-4 flex gap-x-4 h-23 items-end">
        <div className="flex flex-col items-start justify-start w-full ">
          <div className="flex gap-x-1 items-center">
            <Image
              src="/images/logo/logo-sm.png"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              alt="News because blog is in progress"
              height={24}
              width={24}
            />
            <h2 className="font-black tracking-tight text-2xl text-black dark:text-white">
              News
            </h2>
          </div>
          <h2 className="font-black tracking-tight text-2xl text-zinc-500 dark:text-zinc-400">
            {format(new Date(), 'MMM d')}
          </h2>
        </div>
      </div>
      <News />
    </div>
  </main>
)

export default NewsPage
