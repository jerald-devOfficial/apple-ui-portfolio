'use client'

import DeviceStatus from '@/components/DeviceStatus'
import DisplayTime from '@/components/DisplayTime'
import ThemeToggle from '@/components/ThemeToggle'
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const ResponsiveUI = ({
  children
}: Readonly<{
  children: React.ReactNode
}>) => {
  const pathname = usePathname()
  const session = useSession()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  // Menu links for desktop header
  const menuLinks = [
    { name: 'File', href: '#' },
    { name: 'Edit', href: '#' },
    { name: 'View', href: '#' },
    { name: 'Go', href: '#' },
    { name: 'Window', href: '#' },
    { name: 'Help', href: '#' }
  ]

  // Handle menu clicks
  const handleMenuClick = (menuName: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setActiveMenu(activeMenu === menuName ? null : menuName)
  }

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

  // Group 1: Finder & System Apps
  const dockGroup1 = [
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
      name: 'blog',
      title: 'Blog',
      img: '/images/icons/macOS-safari.png',
      path: '/blog'
    },
    {
      name: 'news',
      title: 'News',
      img: '/images/icons/macOS-news.png',
      path: '/news'
    }
  ]

  // Group 2: Documents & Files
  const dockGroup2 = [
    {
      name: 'resume',
      title: 'Download Resume',
      img: '/images/icons/macOS-resume.png',
      path: '/pdfs/updated-resume.pdf'
    }
  ]

  // Group 3: Communication
  const dockGroup3 = [
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
    }
  ]

  // Group 4: Utilities & Settings
  const dockGroup4 = [
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

  // Combine all dock groups for mobile view
  const dockMacOS = [...dockGroup1, ...dockGroup2, ...dockGroup3, ...dockGroup4]

  // Get current page title based on path
  const getCurrentPageTitle = () => {
    const activeDock = dockMacOS.find((dock) => dock?.path === pathname)
    return activeDock?.title || 'Finder'
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="flex justify-between items-center px-5 xs:px-12 py-4 sm:px-4 sm:py-1.5 w-full xl:hidden text-sm font-bold text-black dark:text-white">
        <DisplayTime />
        <div className="flex items-center gap-x-4">
          <ThemeToggle />
          <DeviceStatus />
        </div>
      </header>

      {/* Desktop Header - macOS style */}
      <header className="xl:flex justify-between items-center px-4 py-1.5 w-full hidden dark:bg-black/10 backdrop-blur-[50px] bg-white/50">
        <div className="flex items-center">
          {/* Apple Logo */}
          <Link href={'/'} className="px-3">
            <Image
              src={'/images/logo/logo.png'}
              alt={`JB macOS design`}
              height={18}
              width={18}
            />
          </Link>

          {/* Current Page Title */}
          <button className="px-3 py-0.5 text-sm font-semibold rounded hover:bg-gray-500/30 cursor-pointer">
            {getCurrentPageTitle()}
          </button>

          {/* Menu Links */}
          <div className="flex space-x-1">
            {menuLinks.map((link) => (
              <button
                key={link.name}
                onClick={handleMenuClick(link.name)}
                className={`px-3 cursor-pointer py-0.5 text-sm font-semibold rounded ${
                  activeMenu === link.name
                    ? 'bg-gray-500/50'
                    : 'hover:bg-gray-500/30'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right side status items */}
        <div className="flex items-center gap-x-4">
          <ThemeToggle />
          {session.status === 'authenticated' && session.data?.user?.image && (
            <div className="h-6 w-6 rounded-full overflow-hidden">
              <Image
                src={session.data.user.image}
                alt="User"
                width={24}
                height={24}
                className="object-cover"
              />
            </div>
          )}
          <DeviceStatus />
          <DisplayTime />
        </div>
      </header>

      {children}

      {/* Mobile Footer/Dock */}
      <footer className='flex w-full xs:w-[unset] xs:gap-x-[30px] sm:gap-x-4 py-5 px-5 sm:px-7 sm:py-4 before:absolute before:content-[""] before:bg-[#BFBFBF70]/44 before:backdrop-blur-[50px] before:-z-10 bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30 rounded-none xs:rounded-[40px] sm:rounded-[30px] before:content items-center justify-around xs:justify-center my-0 xs:my-3 sm:my-4 xl:hidden'>
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

      {/* Desktop Footer/Dock - With groups and separators */}
      <footer className='hidden xl:flex xl:gap-x-0.5 xl:px-1.5 xl:py-1.5 before:absolute before:content-[""] before:bg-[#F6F6F6]/36 dark:before:bg-[#1A1A1A]/36 before:backdrop-blur-[135px] before:blur-[6px] before:-z-10 bg-white/40 dark:bg-black/10 rounded-2xl before:content items-baseline justify-center xl:my-2 ring-1 ring-white/30 dark:ring-white/10 ring-inset shadow-sm shadow-black/15'>
        {/* Group 1 */}
        {dockGroup1.map((item) => (
          <DockItem key={item.name} item={item} pathname={pathname} />
        ))}

        {/* Separator */}
        <div className="mx-1 h-10 w-px bg-gray-400/20 self-center"></div>

        {/* Group 2 */}
        {dockGroup2.map((item) => (
          <DockItem key={item.name} item={item} pathname={pathname} />
        ))}

        {/* Separator */}
        <div className="mx-1 h-10 w-px bg-gray-400/20 self-center"></div>

        {/* Group 3 */}
        {dockGroup3.map((item) => (
          <DockItem key={item.name} item={item} pathname={pathname} />
        ))}

        {/* Separator */}
        <div className="mx-1 h-10 w-px bg-gray-400/20 self-center"></div>

        {/* Group 4 */}
        {dockGroup4.map((item) => (
          <DockItem key={item.name} item={item} pathname={pathname} />
        ))}
      </footer>
    </>
  )
}

// Define the dock item type
interface DockItemType {
  name: string
  title: string
  img: string
  path?: string
  click?: () => void
}

// Extract dock item to a separate component to avoid repetition
const DockItem = ({
  item,
  pathname
}: {
  item: DockItemType
  pathname: string
}) => {
  const isActive = item.path === pathname

  if (item.click) {
    return (
      <button
        onClick={item.click}
        className="flex flex-col items-center justify-center h-[60px] group cursor-pointer relative"
      >
        <span className="hidden -top-9 absolute left-1/2 transform -translate-x-1/2 px-2 py-1 bg-white/80 dark:bg-zinc-800/90 text-gray-800 dark:text-white text-xs font-medium rounded-md shadow-lg backdrop-blur-sm border border-white/20 dark:border-zinc-700/50 whitespace-nowrap group-hover:block opacity-0 group-hover:opacity-100 z-10">
          {item.title}
        </span>

        <Image
          src={item.img}
          alt={item.name}
          height={50}
          width={50}
          className="transition-all transform-gpu group-hover:scale-150 drop-shadow-none group-hover:drop-shadow-md"
          style={{
            transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformOrigin: 'bottom'
          }}
        />
      </button>
    )
  }

  if (item.name === 'resume' && item.path) {
    return (
      <Link
        href={item.path}
        target={'_blank'}
        download
        className="flex flex-col items-center justify-center h-[60px] group cursor-pointer relative"
      >
        <span className="hidden -top-9 absolute left-1/2 transform -translate-x-1/2 px-2 py-1 bg-white/80 dark:bg-zinc-800/90 text-gray-800 dark:text-white text-xs font-medium rounded-md shadow-lg backdrop-blur-sm border border-white/20 dark:border-zinc-700/50 whitespace-nowrap group-hover:block opacity-0 group-hover:opacity-100 z-10">
          {item.title}
        </span>
        <Image
          alt={item.name}
          src={item.img}
          height={50}
          width={50}
          className="transition-all transform-gpu group-hover:scale-150 drop-shadow-none group-hover:drop-shadow-md"
          style={{
            transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformOrigin: 'bottom'
          }}
        />
        {isActive && (
          <span className="h-1 w-1 bg-blue-500 dark:bg-blue-400 rounded-full" />
        )}
      </Link>
    )
  }

  if (item.name === 'mails' && !item.click) {
    return null // Handle this special case
  }

  // Only render Link if path exists
  if (item.path) {
    return (
      <Link
        href={item.path}
        className="flex flex-col items-center justify-center h-[60px] group cursor-pointer relative"
      >
        <span className="hidden -top-9 absolute left-1/2 transform -translate-x-1/2 px-2 py-1 bg-white/80 dark:bg-zinc-800/90 text-gray-800 dark:text-white text-xs font-medium rounded-md shadow-lg backdrop-blur-sm border border-white/20 dark:border-zinc-700/50 whitespace-nowrap group-hover:block opacity-0 group-hover:opacity-100 z-10">
          {item.title}
        </span>
        <Image
          alt={item.name}
          src={item.img}
          height={50}
          width={50}
          className="transition-all transform-gpu group-hover:scale-150 drop-shadow-none group-hover:drop-shadow-md"
          style={{
            transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformOrigin: 'bottom'
          }}
        />
        {isActive && (
          <span className="h-1 w-1 bg-blue-500 dark:bg-blue-400 rounded-full" />
        )}
      </Link>
    )
  }

  // Fallback for items without path or click handler
  return (
    <div className="flex flex-col items-center justify-center h-[60px] group cursor-pointer relative">
      <span className="hidden -top-9 absolute left-1/2 transform -translate-x-1/2 px-2 py-1 bg-white/80 dark:bg-zinc-800/90 text-gray-800 dark:text-white text-xs font-medium rounded-md shadow-lg backdrop-blur-sm border border-white/20 dark:border-zinc-700/50 whitespace-nowrap group-hover:block opacity-0 group-hover:opacity-100 z-10">
        {item.title}
      </span>
      <Image
        alt={item.name}
        src={item.img}
        height={50}
        width={50}
        className="transition-all transform-gpu group-hover:scale-125 opacity-70 drop-shadow-none group-hover:drop-shadow-sm"
        style={{
          transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformOrigin: 'bottom'
        }}
      />
    </div>
  )
}

export default ResponsiveUI
