import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { Montserrat } from 'next/font/google'
import Link from 'next/link'
import { ReactNode } from 'react'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

interface DiaryLayoutProps {
  children: ReactNode
  backLink?: string
  backText?: string
  headerContent?: ReactNode
}

const DiaryLayout = ({
  children,
  backLink = '/diaries',
  backText = 'Back',
  headerContent
}: DiaryLayoutProps) => (
  <main
    className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
  >
    <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md px-6 py-3 border-b border-gray-200 dark:border-zinc-700">
        <Link href={backLink}>
          <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-x-1">
            <ArrowLeftIcon className="w-5 h-5" />
            <span>{backText}</span>
          </button>
        </Link>
        {headerContent}
      </div>

      {/* Content */}
      {children}
    </div>
  </main>
)

export default DiaryLayout
