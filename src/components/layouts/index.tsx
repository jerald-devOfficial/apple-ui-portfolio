'use client'

import DeviceStatus from '@/components/DeviceStatus'
import DisplayTime from '@/components/DisplayTime'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ResponsiveUI = ({
  children
}: Readonly<{
  children: React.ReactNode
}>) => {
  const pathname = usePathname()
  const dock = [
    {
      name: 'Portfolio',
      img: '/images/icons/contacts.png',
      path: '/portfolio'
    },
    {
      name: 'News',
      img: '/images/icons/news.png',
      path: '/news'
    },
    {
      name: 'Contact',
      img: '/images/icons/mail.png',
      path: '/contact'
    },
    {
      name: 'Home',
      img: '/images/icons/home.png',
      path: '/'
    }
  ]

  const dockMacOS = [
    {
      name: 'Home',
      img: '/images/icons/macOS-finder.png',
      path: '/'
    },
    {
      name: 'Portfolio',
      img: '/images/icons/macOS-contacts.png',
      path: '/portfolio'
    },
    {
      name: 'News',
      img: '/images/icons/macOS-news.png',
      path: '/news'
    }
  ]
  return (
    <>
      <header className='flex justify-between items-center px-5 xs:px-12 py-4 sm:px-4 sm:py-1.5 w-full xl:hidden'>
        <DisplayTime />
        <DeviceStatus />
      </header>
      <header className='xl:flex justify-between items-center px-4 py-1.5 w-full hidden bg-white/50 backdrop-blur-[50px]'>
        <div className='flex items-center gap-x-4'>
          <Link href={'/'}>
            <Image
              src={'/images/logo/logo.png'}
              alt={`Jerald's macOS design`}
              height={24}
              width={24}
            />
          </Link>
          <span className='text-black font-semibold text-base'>
            {dockMacOS.find((dock) => dock.path === pathname)?.name}
          </span>
        </div>
        <div className='flex items-center gap-x-4'>
          <DeviceStatus />
          <DisplayTime />
        </div>
      </header>
      {children}

      <footer className='flex overflow-hidden w-full xs:w-[unset] xs:gap-x-[30px] sm:gap-x-4 py-5 px-5 sm:px-7 sm:py-4 before:absolute before:content-[""] before:bg-[#BFBFBF70]/44 before:backdrop-blur-[50px] before:-z-10 bg-white/30 hover:bg-white/40 rounded-none xs:rounded-[40px] sm:rounded-[30px] before:content items-center justify-around xs:justify-center my-0 xs:my-3 sm:my-4 xl:hidden'>
        {dock.map((item) => (
          <Link href={`${item.path}`} key={item.name} className='block'>
            <div className='relative xs:h-[60px] xs:w-[60px] h-10 w-10 hover:ring-2 hover:ring-offset-2 hover:ring-rose-500 hover:rounded-[15px]'>
              <Image alt={item.name} src={item.img} fill priority />
            </div>
          </Link>
        ))}
      </footer>
      <footer className='hidden xl:flex  xl:gap-x-0.5 xl:px-1.5 xl:py-1.5 before:absolute before:content-[""] before:bg-[#F6F6F6]/36 before:backdrop-blur-[135px] before:blur-[6px] before:-z-10 bg-lime-300/40 rounded-2xl before:content items-baseline justify-center xl:my-2 ring-1 ring-white/30 ring-inset shadow shadow-black/15'>
        {dockMacOS.map((item, index) => (
          <Link
            href={`${item.path}`}
            className='flex flex-col items-center justify-center h-[60px] transition-transform transform-gpu hover:scale-150 cursor-pointer'
            key={item.name}
            style={{ transition: 'transform 0.3s', transformOrigin: 'bottom' }}
          >
            <Image alt={item.name} src={item.img} height={50} width={50} />
            {dockMacOS[index].path === pathname && (
              <span className='h-1 w-1 bg-[#808080] rounded-full' />
            )}
          </Link>
        ))}
      </footer>
    </>
  )
}

export default ResponsiveUI
