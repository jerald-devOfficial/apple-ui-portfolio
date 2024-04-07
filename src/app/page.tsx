'use client'

import { contact } from '@/constants'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { Fragment } from 'react'

export default function Home() {
  const session = useSession()
  const icons = [
    {
      name: 'Call Me',
      img: '/images/icons/calls.png',
      click: () => (window.location.href = `tel:${contact.phoneNumber}`)
    },
    {
      name: 'News',
      img: '/images/icons/news.png',
      path: '/news'
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
    }
  ]

  return (
    <main className='py-9 sm:py-12 flex-grow w-full flex flex-col items-center'>
      <section className='grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-y-5 sm:gap-y-12 px-5 sm:px-12 md:px-0 xl:hidden max-w-[955px] place-content-center w-full'>
        {icons.map((item) => (
          <Fragment key={item.name}>
            {item.click && item.name !== 'Resume' && (
              <button
                className='grid place-items-center gap-y-1 w-full'
                onClick={item.click}
              >
                <div className='block'>
                  <div className='relative xs:h-[60px] xs:w-[60px] h-10 w-10 cursor-pointer'>
                    <Image
                      alt={item.name}
                      src={item.img}
                      fill
                      priority
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    />
                  </div>
                </div>
                <span className='text-sm font-normal text-white'>
                  {item.name}
                </span>
              </button>
            )}

            {!item.click && item.name !== 'Resume' && item.name !== 'Mails' && (
              <Link
                href={`${item.path}`}
                className='grid place-items-center gap-y-1 w-full'
              >
                <div className='block'>
                  <div className='relative xs:h-[60px] xs:w-[60px] h-10 w-10 cursor-pointer'>
                    <Image
                      alt={item.name}
                      src={item.img}
                      fill
                      priority
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    />
                  </div>
                </div>
                <span className='text-sm font-normal text-white'>
                  {item.name}
                </span>
              </Link>
            )}

            {!item.click && item.name === 'Resume' && (
              <Link
                className='grid place-items-center gap-y-1 w-full'
                href={`${item.path}`}
                target={'_blank'}
                download
              >
                <div className='block'>
                  <div className='relative xs:h-[60px] xs:w-[60px] h-10 w-10 cursor-pointer'>
                    <Image
                      alt={item.name}
                      src={item.img}
                      fill
                      priority
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    />
                  </div>
                </div>
                <span className='text-sm font-normal text-white'>
                  {item.name}
                </span>
              </Link>
            )}

            {item.name === 'Mails' ? (
              session.status === 'authenticated' ? (
                <Link
                  href={`${item.path}`}
                  className='grid place-items-center gap-y-1 w-full'
                >
                  <div className='block'>
                    <div className='relative xs:h-[60px] xs:w-[60px] h-10 w-10 cursor-pointer'>
                      <Image
                        alt={item.name}
                        src={item.img}
                        fill
                        priority
                        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                      />
                    </div>
                  </div>
                  <span className='text-sm font-normal text-white'>
                    {item.name}
                  </span>
                </Link>
              ) : null
            ) : null}
          </Fragment>
        ))}
      </section>
    </main>
  )
}
