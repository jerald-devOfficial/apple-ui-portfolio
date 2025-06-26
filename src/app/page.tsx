'use client'

import AboutMeWidget from '@/components/AboutMeWidget'
import PhotosWidget from '@/components/PhotosWidget'
import { contact } from '@/constants'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { Fragment } from 'react'

const Home = () => {
  const session = useSession()
  const icons = [
    {
      name: 'Call Me',
      img: '/images/icons/calls.png',
      click: () => (window.location.href = `tel:${contact.phoneNumber}`)
    },
    {
      name: 'Diaries',
      img: '/images/icons/diary.png',
      path: '/diaries'
    },
    {
      name: 'News',
      img: '/images/icons/news.png',
      path: '/news'
    },
    {
      name: 'Blog',
      img: '/images/icons/safari.png',
      path: '/blog'
    },
    {
      name: 'Resume',
      img: '/images/icons/resume.png',
      path: '/pdfs/updated-resume.pdf'
    },
    {
      name: 'Mails',
      img: '/images/icons/gmail.png',
      path: '/mails'
    },
    {
      name: 'Web3',
      img: '/images/icons/metamask.png',
      path: '/web3'
    }
  ]

  return (
    <main className="grow w-full flex flex-col items-center overflow-hidden">
      {/* Mobile Layout (xs to sm) - iOS Widget Style */}
      <section className="sm:hidden px-4 w-full py-4 space-y-3">
        {/* Top Row - About Me Widget (2x2 tiles) */}
        <div className="h-[160px] max-w-[300px] xs:max-w-[350px] mx-auto">
          <AboutMeWidget />
        </div>

        {/* Second Row - Photos Widget (2x2 tiles) */}
        <div className="h-[160px] max-w-[300px] xs:max-w-[350px] mx-auto">
          <PhotosWidget />
        </div>

        {/* App Icons Grid - Below Widgets */}
        <div className="pt-2">
          <div className="grid grid-cols-4 gap-3 place-content-center w-full max-w-[300px] xs:max-w-[350px] mx-auto">
            {icons.slice(0, 6).map((item) => (
              <Fragment key={item.name}>
                {item.click && item.name !== 'Resume' && (
                  <button
                    className="grid place-items-center gap-y-1 w-full"
                    onClick={item.click}
                  >
                    <div className="relative size-[50px] xs:size-[60px] cursor-pointer">
                      <Image
                        alt={item.name}
                        src={item.img}
                        fill
                        priority
                        sizes="50px xs:60px"
                      />
                    </div>
                    <span className="text-[10px] font-normal text-white text-center leading-tight">
                      {item.name}
                    </span>
                  </button>
                )}

                {!item.click &&
                  item.name !== 'Resume' &&
                  item.name !== 'Mails' && (
                    <Link
                      href={`${item.path}`}
                      className="grid place-items-center gap-y-1 w-full"
                    >
                      <div className="relative size-[50px] xs:size-[60px] cursor-pointer">
                        <Image
                          alt={item.name}
                          src={item.img}
                          fill
                          priority
                          sizes="50px xs:60px"
                        />
                      </div>
                      <span className="text-[10px] font-normal text-white text-center leading-tight">
                        {item.name}
                      </span>
                    </Link>
                  )}

                {!item.click && item.name === 'Resume' && (
                  <Link
                    className="grid place-items-center gap-y-1 w-full"
                    href={`${item.path}`}
                    target={'_blank'}
                    download
                  >
                    <div className="relative size-[50px] xs:size-[60px] cursor-pointer">
                      <Image
                        alt={item.name}
                        src={item.img}
                        fill
                        priority
                        sizes="50px xs:60px"
                      />
                    </div>
                    <span className="text-[10px] font-normal text-white text-center leading-tight">
                      {item.name}
                    </span>
                  </Link>
                )}

                {item.name === 'Mails' &&
                  (session.status === 'authenticated' ? (
                    <Link
                      href={`${item.path}`}
                      className="grid place-items-center gap-y-1 w-full"
                    >
                      <div className="relative size-[50px] xs:size-[60px] cursor-pointer">
                        <Image
                          alt={item.name}
                          src={item.img}
                          fill
                          priority
                          sizes="50px xs:60px"
                        />
                      </div>
                      <span className="text-[10px] font-normal text-white text-center leading-tight">
                        {item.name}
                      </span>
                    </Link>
                  ) : null)}
              </Fragment>
            ))}

            {/* Web3 icon in second row if we have 7 icons */}
            {icons.slice(6).map((item) => (
              <Link
                key={item.name}
                href={`${item.path}`}
                className="grid place-items-center gap-y-1 w-full"
              >
                <div className="relative size-[50px] xs:size-[60px] cursor-pointer">
                  <Image
                    alt={item.name}
                    src={item.img}
                    fill
                    priority
                    sizes="50px xs:60px"
                  />
                </div>
                <span className="text-[10px] font-normal text-white text-center leading-tight">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tablet Layout (sm to xl) */}
      <section className="hidden sm:block xl:hidden px-5 sm:px-12 w-full max-w-4xl space-y-8 py-6">
        {/* Top Row - About Me and Photos side by side on larger tablets */}
        <div className="grid md:grid-cols-2 gap-6">
          <AboutMeWidget />
          <PhotosWidget />
        </div>

        {/* App Icons - Tablet */}
        <div className="grid grid-cols-5 md:grid-cols-6 gap-y-8 place-content-center w-full">
          {icons.map((item) => (
            <Fragment key={item.name}>
              {item.click && item.name !== 'Resume' && (
                <button
                  className="grid place-items-center gap-y-2 w-full"
                  onClick={item.click}
                >
                  <div className="block">
                    <div className="relative h-[60px] w-[60px] cursor-pointer">
                      <Image
                        alt={item.name}
                        src={item.img}
                        fill
                        priority
                        sizes="60px"
                      />
                    </div>
                  </div>
                  <span className="text-sm font-normal text-white text-center">
                    {item.name}
                  </span>
                </button>
              )}

              {!item.click &&
                item.name !== 'Resume' &&
                item.name !== 'Mails' && (
                  <Link
                    href={`${item.path}`}
                    className="grid place-items-center gap-y-2 w-full"
                  >
                    <div className="block">
                      <div className="relative h-[60px] w-[60px] cursor-pointer">
                        <Image
                          alt={item.name}
                          src={item.img}
                          fill
                          priority
                          sizes="60px"
                        />
                      </div>
                    </div>
                    <span className="text-sm font-normal text-white text-center">
                      {item.name}
                    </span>
                  </Link>
                )}

              {!item.click && item.name === 'Resume' && (
                <Link
                  className="grid place-items-center gap-y-2 w-full"
                  href={`${item.path}`}
                  target={'_blank'}
                  download
                >
                  <div className="block">
                    <div className="relative h-[60px] w-[60px] cursor-pointer">
                      <Image
                        alt={item.name}
                        src={item.img}
                        fill
                        priority
                        sizes="60px"
                      />
                    </div>
                  </div>
                  <span className="text-sm font-normal text-white text-center">
                    {item.name}
                  </span>
                </Link>
              )}

              {item.name === 'Mails' &&
                (session.status === 'authenticated' ? (
                  <Link
                    href={`${item.path}`}
                    className="grid place-items-center gap-y-2 w-full"
                  >
                    <div className="block">
                      <div className="relative h-[60px] w-[60px] cursor-pointer">
                        <Image
                          alt={item.name}
                          src={item.img}
                          fill
                          priority
                          sizes="60px"
                        />
                      </div>
                    </div>
                    <span className="text-sm font-normal text-white text-center">
                      {item.name}
                    </span>
                  </Link>
                ) : null)}
            </Fragment>
          ))}
        </div>
      </section>

      {/* Desktop Layout with Widgets (xl+) */}
      <section className="hidden xl:block w-full h-full relative">
        {/* Main Content Area - Centered Widgets */}
        <div className="h-full flex items-center justify-center px-8">
          <div className="grid grid-cols-2 gap-12 max-w-5xl w-full">
            {/* About Me Widget - Larger and more spaced */}
            <div className="min-h-[400px]">
              <AboutMeWidget />
            </div>

            {/* Photos Widget - Larger and more spaced */}
            <div className="min-h-[400px]">
              <PhotosWidget />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
