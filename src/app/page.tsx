'use client'

import { contact } from '@/constants'
import Image from 'next/image'

export default function Home() {
  const icons = [
    {
      name: 'Calls',
      img: '/images/icons/calls.png',
      click: () => (window.location.href = `tel:${contact.phoneNumber}`)
    },
    {
      name: 'FaceTime',
      img: '/images/icons/facetime.png'
    },
    {
      name: 'Calendar',
      img: '/images/icons/calendar.png'
    },
    {
      name: 'Photos',
      img: '/images/icons/photos.png'
    },
    {
      name: 'Camera',
      img: '/images/icons/camera.png'
    },
    {
      name: 'Notes',
      img: '/images/icons/notes.png'
    },
    {
      name: 'Reminders',
      img: '/images/icons/reminders.png'
    },
    {
      name: 'Clock',
      img: '/images/icons/clock.png'
    },
    {
      name: 'TV',
      img: '/images/icons/tv.png'
    },
    {
      name: 'Podcasts',
      img: '/images/icons/podcasts.png'
    },
    {
      name: 'App Store',
      img: '/images/icons/app-store.png'
    },
    {
      name: 'Music',
      img: '/images/icons/music.png'
    }
  ]

  return (
    <main className='py-9 sm:py-12 flex-grow w-full flex flex-col items-center'>
      <section className='grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-y-5 sm:gap-y-12 px-5 sm:px-12 md:px-0 xl:hidden max-w-[955px] place-content-center w-full'>
        {icons.map((item) =>
          item.click ? (
            <div
              key={item.name}
              className='grid place-items-center gap-y-1 w-full'
              onClick={item.click}
            >
              <div className='block'>
                <div className='relative xs:h-[60px] xs:w-[60px] h-10 w-10 cursor-pointer'>
                  <Image alt={item.name} src={item.img} fill priority />
                </div>
              </div>
              <span className='text-sm font-normal'>{item.name}</span>
            </div>
          ) : (
            <div
              key={item.name}
              className='grid place-items-center gap-y-1 w-full'
            >
              <div className='block'>
                <div className='relative xs:h-[60px] xs:w-[60px] h-10 w-10 cursor-pointer'>
                  <Image alt={item.name} src={item.img} fill priority />
                </div>
              </div>
              <span className='text-sm font-normal'>{item.name}</span>
            </div>
          )
        )}
      </section>
    </main>
  )
}
