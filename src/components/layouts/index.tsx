'use client'

import DeviceStatus from '@/components/DeviceStatus'
import DisplayTime from '@/components/DisplayTime'
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

const ResponsiveUI = ({
  children
}: Readonly<{
  children: React.ReactNode
}>) => {
  const pathname = usePathname()
  const session = useSession()

  const dock = [
    {
      name: 'Portfolio',
      img: '/images/icons/contacts.png',
      path: '/portfolio'
    },
    {
      name: 'Contact',
      img: '/images/icons/mail.png',
      path: '/contact'
    },
    {
      name: 'Auth',
      img: `/images/icons/${
        session.status === 'authenticated' ? 'logout' : 'login'
      }.png`,
      click: () =>
        session.status === 'authenticated' ? signOut() : signIn('google')
    },
    {
      name: 'Home',
      img: '/images/icons/home.png',
      path: '/'
    }
  ]

  const dockMacOS = [
    {
      name: 'home',
      title: 'Home',
      img: '/images/icons/macOS-finder.png',
      path: '/'
    },
    {
      name: 'portfolio',
      title: 'Portfolio',
      img: '/images/icons/macOS-contacts.png',
      path: '/portfolio'
    },
    {
      name: 'diaries',
      title: 'Diaries',
      img: '/images/icons/macOS-diary.png',
      path: '/diaries'
    },
    {
      name: 'news',
      title: 'News',
      img: '/images/icons/macOS-news.png',
      path: '/news'
    },
    {
      name: 'resume',
      title: 'Download Resume',
      img: '/images/icons/macOS-resume.png',
      path: '/pdfs/updated-resume.pdf'
    },
    {
      name: 'contact',
      title: 'Contact',
      img: '/images/icons/macOS-mail.png',
      path: '/contact'
    },
    {
      name: 'mails',
      title: 'Mails',
      img: '/images/icons/macOS-gmail.png',
      path: '/mails'
    },
    {
      name: 'web3',
      title: 'Web3',
      img: '/images/icons/macOS-metamask.png',
      path: '/web3'
    },
    {
      name: 'admin',
      title:
        session.status === 'authenticated' ? 'Logout Admin' : 'Login as Admin',
      img: `/images/icons/macOS-${
        session.status === 'authenticated' ? 'logout' : 'login'
      }.png`,
      click: () =>
        session.status === 'authenticated' ? signOut() : signIn('google')
    }
  ]

  return (
    <>
      <header className="flex justify-between items-center px-5 xs:px-12 py-4 sm:px-4 sm:py-1.5 w-full xl:hidden">
        <DisplayTime />
        <DeviceStatus />
      </header>
      <header className="xl:flex justify-between items-center px-4 py-1.5 w-full hidden bg-white/50 backdrop-blur-[50px]">
        <div className="flex items-center gap-x-4">
          <Link href={'/'}>
            <Image
              src={'/images/logo/logo.png'}
              alt={`Jerald's macOS design`}
              height={24}
              width={24}
            />
          </Link>
          <span className="text-black font-semibold text-base">
            {dockMacOS.find((dock) => dock?.path === pathname)?.title}
          </span>
        </div>
        <div className="flex items-center gap-x-4">
          <DeviceStatus />
          <DisplayTime />
        </div>
      </header>
      {children}
      <footer className='flex w-full xs:w-[unset] xs:gap-x-[30px] sm:gap-x-4 py-5 px-5 sm:px-7 sm:py-4 before:absolute before:content-[""] before:bg-[#BFBFBF70]/44 before:backdrop-blur-[50px] before:-z-10 bg-white/20 hover:bg-white/30 rounded-none xs:rounded-[40px] sm:rounded-[30px] before:content items-center justify-around xs:justify-center my-0 xs:my-3 sm:my-4 xl:hidden'>
        {dock.map((item) =>
          item.click ? (
            <button
              onClick={item.click}
              key={item.name}
              className="relative xs:h-[60px] xs:w-[60px] h-10 w-10"
            >
              <Image
                alt={item.name}
                src={item.img}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </button>
          ) : (
            <Link href={`${item.path}`} key={item.name} className="block">
              <div className="relative xs:h-[60px] xs:w-[60px] h-10 w-10">
                <Image
                  alt={item.name}
                  src={item.img}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </Link>
          )
        )}
      </footer>
      <footer className='hidden xl:flex  xl:gap-x-0.5 xl:px-1.5 xl:py-1.5 before:absolute before:content-[""] before:bg-[#F6F6F6]/36 before:backdrop-blur-[135px] before:blur-[6px] before:-z-10 bg-white/40 rounded-2xl before:content items-baseline justify-center xl:my-2 ring-1 ring-white/30 ring-inset shadow-sm shadow-black/15'>
        {dockMacOS.map((item, index) => (
          <Fragment key={item.name}>
            {item.click && (
              <button
                onClick={item.click}
                className="flex flex-col items-center justify-center h-[60px] group cursor-pointer relative"
              >
                <span className="hidden -top-8 absolute group-hover:block text-gray-800 text-sm font-semibold transition-transform transform-gpu text-nowrap">
                  {item.title}
                </span>

                <Image
                  src={item.img}
                  alt={item.name}
                  height={50}
                  width={50}
                  className="transition-transform transform-gpu group-hover:scale-150"
                  style={{
                    transition: 'transform 0.3s',
                    transformOrigin: 'bottom'
                  }}
                />
              </button>
            )}

            {item.name === 'resume' && (
              <Link
                href={`${item.path}`}
                target={'_blank'}
                download
                className="flex flex-col items-center justify-center h-[60px] group cursor-pointer relative"
              >
                <span className="hidden -top-8 absolute group-hover:block text-gray-800 text-sm font-semibold transition-transform transform-gpu text-nowrap">
                  {item.title}
                </span>
                <Image
                  alt={item.name}
                  src={item.img}
                  height={50}
                  width={50}
                  className="transition-transform transform-gpu group-hover:scale-150"
                  style={{
                    transition: 'transform 0.3s',
                    transformOrigin: 'bottom'
                  }}
                />
                {dockMacOS[index]?.path === pathname && (
                  <span className="h-1 w-1 bg-[#808080] rounded-full" />
                )}
              </Link>
            )}

            {item.name === 'mails' &&
              (session.status === 'authenticated' ? (
                <Link
                  href={`${item.path}`}
                  className="flex flex-col items-center justify-center h-[60px] group cursor-pointer relative"
                >
                  <span className="hidden -top-8 absolute group-hover:block text-gray-800 text-sm font-semibold transition-transform transform-gpu text-nowrap">
                    {item.title}
                  </span>
                  <Image
                    alt={item.name}
                    src={item.img}
                    height={50}
                    width={50}
                    className="transition-transform transform-gpu group-hover:scale-150"
                    style={{
                      transition: 'transform 0.3s',
                      transformOrigin: 'bottom'
                    }}
                  />
                  {dockMacOS[index]?.path === pathname && (
                    <span className="h-1 w-1 bg-[#808080] rounded-full" />
                  )}
                </Link>
              ) : null)}

            {!item.click && !['resume', 'mails'].includes(item.name) && (
              <Link
                href={`${item.path}`}
                className="flex flex-col items-center justify-center h-[60px] group cursor-pointer relative"
              >
                <span className="hidden -top-8 absolute group-hover:block text-gray-800 text-sm font-semibold transition-transform transform-gpu text-nowrap">
                  {item.title}
                </span>
                <Image
                  alt={item.name}
                  src={item.img}
                  height={50}
                  width={50}
                  className="transition-transform transform-gpu group-hover:scale-150"
                  style={{
                    transition: 'transform 0.3s',
                    transformOrigin: 'bottom'
                  }}
                />
                {dockMacOS[index]?.path === pathname && (
                  <span className="h-1 w-1 bg-[#808080] rounded-full" />
                )}
              </Link>
            )}
          </Fragment>
        ))}
      </footer>
    </>
  )
}

export default ResponsiveUI
