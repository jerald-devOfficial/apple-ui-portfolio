'use client'

import { contact } from '@/constants'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const icons = [
    {
      name: 'Calls',
      img: '/images/icons/calls.png',
      click: () => (window.location.href = `tel:${contact.phoneNumber}`)
    },
    {
      name: 'Resume',
      img: '/images/icons/resume.png',
      path: '/pdfs/updated-resume.pdf'
    }
  ]

  return (
    <main className='py-9 sm:py-12 flex-grow w-full flex flex-col items-center'>
      <section className='grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-y-5 sm:gap-y-12 px-5 sm:px-12 md:px-0 xl:hidden max-w-[955px] place-content-center w-full'>
        {icons.map((item) => (
          <>
            {item.click && item.name !== 'Resume' && (
              <button
                key={item.name}
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

            {!item.click && item.name !== 'Resume' && (
              <div
                key={item.name}
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
              </div>
            )}

            {!item.click && item.name === 'Resume' && (
              <Link
                key={item.name}
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
          </>
        ))}
      </section>
    </main>
  )
}
