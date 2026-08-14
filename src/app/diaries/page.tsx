import Diaries from '@/app/diaries/_components/Diaries'
import { auth } from '@/auth'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Montserrat } from 'next/font/google'
import Link from 'next/link'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

const DiariesPage = async () => {
  const session = await auth()
  const isAuthenticated = Boolean(session?.user)
  const viewerEmail = session?.user?.email?.toLowerCase()

  return (
    <main
      className={`flex overflow-hidden h-full w-full xl:max-w-5xl sm:pt-6 xl:pt-12 lg:max-w-231 mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
    >
      <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-zinc-700 gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Diaries
            {!isAuthenticated && (
              <span className="text-sm ml-2 text-gray-500 dark:text-gray-400 font-normal">
                (Public)
              </span>
            )}
          </h1>

          {isAuthenticated ? (
            <Link href="/diary">
              <button
                type="button"
                className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-x-2 hover:bg-blue-600 transition-colors shadow-sm"
              >
                <PlusIcon className="w-5 h-5" />
                <span>New Entry</span>
              </button>
            </Link>
          ) : null}
        </div>

        <Diaries
          isAuthenticated={isAuthenticated}
          viewerEmail={viewerEmail}
        />
      </div>
    </main>
  )
}

export default DiariesPage
