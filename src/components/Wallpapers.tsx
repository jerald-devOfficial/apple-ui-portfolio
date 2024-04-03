import Image from 'next/image'

const Wallpapers = () => {
  return (
    <div className='absolute block h-full w-full -z-20'>
      <Image
        src={'/images/bg/iOS-light.png'}
        className='object-cover object-center sm:hidden block'
        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw'
        fill
        priority
        alt='iOS'
      />
      <Image
        src={'/images/bg/ipadOS-light.png'}
        className='object-cover object-center hidden sm:block xl:hidden'
        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw'
        fill
        priority
        alt='iOS'
      />
      <Image
        src={'/images/bg/macOS-light.jpeg'}
        className='object-cover object-center hidden xl:block'
        fill
        priority
        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw'
        alt='iOS'
      />
    </div>
  )
}

export default Wallpapers
