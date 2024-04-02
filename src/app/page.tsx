import DeviceStatus from '@/components/DeviceStatus'
import DisplayTime from '@/components/DisplayTime'
import Image from 'next/image'

export default function Home() {
  const dock = [
    {
      name: 'Calls',
      img: '/images/icons/calls.png'
    },
    {
      name: 'Safari',
      img: '/images/icons/safari.png'
    },
    {
      name: 'SMS',
      img: '/images/icons/sms.png'
    },
    {
      name: 'Music',
      img: '/images/icons/music.png'
    }
  ]

  const dockMacOS = [
    {
      name: 'Finder',
      img: '/images/icons/macOS-finder.png'
    },
    {
      name: 'Contacts',
      img: '/images/icons/macOS-contacts.png'
    },
    {
      name: 'Safari',
      img: '/images/icons/macOS-safari.png'
    },
    {
      name: 'News',
      img: '/images/icons/macOS-news.png'
    },
    {
      name: 'Music',
      img: '/images/icons/macOS-music.png'
    }
  ]
  return (
    <>
      <header className='flex justify-between items-center px-12 py-4 sm:px-4 sm:py-1.5 w-full lg:hidden'>
        <DisplayTime />
        <DeviceStatus />
      </header>
      <header className='lg:flex justify-between items-center px-4 py-1.5 w-full hidden bg-white/50 backdrop-blur-[50px]'>
        <div className='flex items-center gap-x-4'>
          <Image
            src={'/images/logo/logo.png'}
            alt={`Jerald's macOS design`}
            height={24}
            width={24}
          />
          <span className='text-black font-semibold text-base'>Home</span>
        </div>
        <div className='flex items-center gap-x-4'>
          <DeviceStatus />
          <DisplayTime />
        </div>
      </header>
      <main className='py-9 sm:py-12 flex-grow'>
        <section className='grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-y-5 sm:gap-y-12 px-5 sm:gap-x-12 md:gap-x-16 lg:gap-x-28 sm:px-12 md:px-0 gap-x-7 lg:hidden'>
          {dock.map((item) => (
            <div
              key={item.name}
              className='grid place-items-center gap-y-1 w-full'
            >
              <Image
                alt={item.name}
                src={item.img}
                height={60}
                width={60}
                priority
              />
              <span className='text-sm font-normal'>{item.name}</span>
            </div>
          ))}
          {dock.map((item) => (
            <div
              key={item.name}
              className='grid place-items-center gap-y-1 w-full'
            >
              <Image
                alt={item.name}
                src={item.img}
                height={60}
                width={60}
                priority
              />
              <span className='text-sm font-normal'>{item.name}</span>
            </div>
          ))}
        </section>
      </main>

      <footer className='flex overflow-hidden gap-x-[30px] sm:gap-x-4 py-5 px-5 sm:px-7 sm:py-4 before:absolute before:content-[""] before:bg-[#BFBFBF70]/44 before:backdrop-blur-[50px] before:-z-10 bg-white/30 rounded-[40px] sm:rounded-[30px] before:content items-center justify-center my-3 sm:my-4 lg:hidden'>
        {dock.map((item) => (
          <Image
            key={item.name}
            alt={item.name}
            src={item.img}
            height={60}
            width={60}
            priority
          />
        ))}
      </footer>
      <footer className='hidden lg:flex  lg:gap-x-0.5 lg:px-1.5 lg:py-1.5 before:absolute before:content-[""] before:bg-[#F6F6F6]/36 before:backdrop-blur-[135px] before:blur-[6px] before:-z-10 bg-lime-300/40 rounded-2xl before:content items-baseline justify-center lg:my-2 ring-1 ring-white/30 ring-inset shadow shadow-black/15'>
        {dockMacOS.map((item, index) => (
          <div
            className='flex flex-col items-center justify-center h-[60px] transition-transform transform-gpu hover:scale-150 cursor-pointer'
            key={item.name}
            style={{ transition: 'transform 0.3s', transformOrigin: 'bottom' }}
          >
            <Image alt={item.name} src={item.img} height={50} width={50} />
            {index === 0 && (
              <span className='h-1 w-1 bg-[#808080] rounded-full' />
            )}
          </div>
        ))}
      </footer>
    </>
  )
}
