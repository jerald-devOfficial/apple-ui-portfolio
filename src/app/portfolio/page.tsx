import Image from 'next/image'

import {
  CodeBracketIcon,
  SquaresPlusIcon,
  BriefcaseIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'

export const icons = [
  {
    title: 'Skills',
    icon: CodeBracketIcon
  },
  {
    title: 'Projects',
    icon: SquaresPlusIcon
  },
  {
    title: 'Work',
    icon: BriefcaseIcon
  },
  {
    title: 'Certificates',
    icon: BookOpenIcon
  }
]

const Portfolio = () => {
  return (
    <main className='flex-grow w-full flex rounded-xl overflow-hidden bg-stone-200 flex-col sm:hidden'>
      <div className='px-4 pt-5 pb-3 flex gap-x-4 items-center hover:bg-[#F5F5F5]'>
        <Image
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          src={'/images/icons/portfolio-thumbnail.png'}
          height={60}
          width={60}
          alt='Portfolio Thumbnail'
        />
        <div className='flex flex-col'>
          <h1 className='font-normal text-base text-black'>Portfolio</h1>
          <h3 className='font-normal text-xs text-[#3C3C43]/60 tracking-tight'>
            Get to know about Jerald here.
          </h3>
        </div>
      </div>
      <hr className='border-[0.3px] border-gray-300 border-solid' />
      <div className='h-32 flex items-center justify-between'>
        <div className='flex items-baseline gap-x-6  justify-evenly w-full'>
          {icons.map((icon) => (
            <div
              className='grid place-content-center place-items-center gap-y-1.5 w-[62px] text-black cursor-pointer hover:text-blue-400 group'
              key={icon.title}
            >
              <span className='rounded-full bg-white group-hover:bg-stone-50 grid place-items-center p-4 w-[62px] h-[62px]'>
                <icon.icon className='h-5 w-5 stroke-2' />
              </span>
              <span className='text-wrap text-center text-xs'>
                {icon.title}
              </span>
            </div>
          ))}
        </div>
      </div>
      <hr className='border-[0.3px] border-gray-300 border-solid' />
    </main>
  )
}

export default Portfolio
