'use client'

import Image from 'next/image'

import { education, projects, skills, workExperiences } from '@/constants'
import {
  CodeBracketIcon,
  SquaresPlusIcon,
  BriefcaseIcon,
  BookOpenIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { Montserrat } from 'next/font/google'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/solid'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState<number | null>(null)

  const icons = [
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

  return (
    <main
      className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
    >
      <div className='flex flex-grow h-full rounded-xl bg-stone-200/95 flex-col shadow-xl overflow-hidden'>
        <div className='flex border-b-[0.3px] border-gray-400/60 sm:border-gray-300/90 border-solid'>
          <div className='px-4 xs:pt-5 hidden xs:pb-3 xs:flex gap-x-4 items-center hover:bg-[#F5F5F5] md:w-1/3 shadow-sm'>
            <div className='block'>
              <div className='relative h-[60px] w-[60px]'>
                <Image
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  src={'/images/icons/portfolio-thumbnail.png'}
                  fill
                  priority
                  alt='Portfolio Thumbnail'
                />
              </div>
            </div>
            <div className='flex flex-col'>
              <h1 className='font-medium text-base text-black'>Portfolio</h1>
              <p className='font-normal text-xs text-gray-700 tracking-tight'>
                Get to know about Jerald here.
              </p>
            </div>
          </div>
          <div
            className={`flex-1 px-4 pt-2.5 pb-3 hidden md:flex gap-x-4 h-[92px] flex-col justify-between items-center bg-white/95 overflow-hidden ${
              activeCategory !== null ? 'shadow' : ''
            }`}
          >
            <div className='flex gap-1'>
              {icons.map((_, i) => (
                <button
                  className={`h-1.5 w-1.5 rounded-full ${
                    activeCategory === i ? 'bg-gray-500' : 'bg-gray-400'
                  }`}
                  key={_.title}
                  onClick={() => setActiveCategory(i)}
                />
              ))}
            </div>
            {activeCategory != null && (
              <div className='flex items-center justify-between h-11 w-full'>
                <div className='flex gap-x-1 w-12 justify-between'>
                  {activeCategory > 0 ? (
                    <ChevronLeftIcon
                      className={`text-blue-600 hover:text-blue-800 h-5 w-5 cursor-pointer flex-1
                    }`}
                      onClick={() => setActiveCategory(activeCategory - 1)}
                    />
                  ) : (
                    <span className='h-5 w-5 flex-1' />
                  )}

                  {activeCategory < icons.length - 1 ? (
                    <ChevronRightIcon
                      className={`text-blue-600 hover:text-blue-800 h-5 w-5 cursor-pointer flex-1
                    }`}
                      onClick={() => setActiveCategory(activeCategory + 1)}
                    />
                  ) : (
                    <span className='h-5 w-5 flex-1' />
                  )}
                </div>
                <h2 className='font-semibold text-lg text-black'>
                  {icons[activeCategory].title}
                </h2>
                <div className='flex w-12 justify-end'>
                  <XMarkIcon
                    className='text-blue-600 h-5 w-5 hover:text-blue-800'
                    onClick={() => setActiveCategory(null)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        {/* start  */}
        <div className='flex-col flex md:flex-row sm:justify-between h-full overflow-hidden'>
          <div className='flex items-center justify-between sm:order-2 md:order-[initial] md:w-1/3 md:justify-center md:border-r-[0.3px] md:border-r-gray-300 md:items-baseline'>
            <div className='flex flex-row md:flex-col py-1 md:py-0 items-baseline gap-x-6 justify-evenly w-full md:mt-6 md:mx-4 md:bg-white md:rounded-xl md:pl-4'>
              {icons.map((icon, index) => (
                <button
                  className={`grid place-content-center place-items-center gap-y-1.5 xs:w-[62px] cursor-pointer md:flex md:items-center md:justify-between group md:w-full md:flex-row-reverse md:px-6 md:py-3.5 md:pr-3 md:pl-0 ${
                    index < icons.length - 1
                      ? 'md:border-b md:border-[#3C3C43]/36 mdd:border-solid'
                      : ''
                  }`}
                  key={icon.title}
                  onClick={() =>
                    activeCategory === index
                      ? setActiveCategory(null)
                      : setActiveCategory(index)
                  }
                >
                  <span className='rounded-full bg-white group-hover:bg-stone-50 grid place-items-center p-4 xs:w-[62px] xs:h-[62px] w-10 h-10 md:h-4 md:w-4 place-content-center'>
                    <icon.icon
                      className={`${
                        activeCategory === index
                          ? 'text-blue-600'
                          : 'text-black'
                      } h-5 w-5 stroke-2 group-hover:text-blue-400`}
                    />
                  </span>
                  <span
                    className={`${
                      activeCategory === index ? 'text-blue-800' : 'text-black'
                    } text-wrap text-center text-xs group-hover:text-blue-600 md:text-base`}
                  >
                    {icon.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <hr className='border-[0.3px] border-gray-300 border-solid sm:order-1 md:hidden' />
          {activeCategory !== null ? (
            <div className='flex flex-col py-5 sm:py-10 px-4 sm:px-12 gap-y-5 sm:gap-y-10 relative overflow-y-auto h-full w-full md:flex-1 bg-white/95'>
              {activeCategory === 0 &&
                skills.map((item) => (
                  <div
                    key={item.title}
                    className='flex gap-x-5 sm:gap-x-10 w-full h-auto'
                  >
                    <div className='relative'>
                      {item.url ? (
                        <a
                          href={`https://${item.url}`}
                          className='h-auto w-24 block'
                        >
                          <Image
                            src={item.img}
                            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                            className='rounded-2xl'
                            width={1}
                            height={1}
                            style={{
                              height: 'auto',
                              width: '100%'
                            }}
                            alt={item.title}
                          />
                        </a>
                      ) : (
                        <div className='h-auto w-24 block'>
                          <Image
                            src={item.img}
                            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                            className='rounded-2xl'
                            width={1}
                            height={1}
                            style={{
                              height: 'auto',
                              width: '100%'
                            }}
                            alt={item.title}
                          />
                        </div>
                      )}
                    </div>
                    <div className='flex flex-col gap-y-2'>
                      <h3 className='text-base font-semibold text-black'>
                        {item.title}
                      </h3>
                      <div className='flex flex-col gap-y-1'>
                        <p className='text-sm font-normal text-black'>
                          {item.desc}
                        </p>
                        {item.url && (
                          <div className='block relative'>
                            <a
                              href={`https://${item.url}`}
                              className='text-sm font-normal no-underline hover:underline text-violet-600 inline-flex items-center gap-x-2'
                            >
                              <LinkIcon height={16} />
                              {item.url}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {activeCategory === 1 &&
                projects.map((item) => (
                  <div key={item.title} className='flex gap-x-10 w-full h-auto'>
                    <div className='relative sm:block hidden md:hidden lg:block'>
                      {item.url ? (
                        <a
                          href={`https://${item.url}`}
                          className='h-auto w-52 block'
                        >
                          <Image
                            src={item.img}
                            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                            className='rounded-lg shadow-xl'
                            width={1}
                            height={1}
                            style={{
                              height: 'auto',
                              width: '100%'
                            }}
                            alt={item.title}
                          />
                        </a>
                      ) : (
                        <div className='h-auto w-24 block'>
                          <Image
                            src={item.img}
                            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                            className='rounded-lg shadow-xl'
                            width={1}
                            height={1}
                            style={{
                              height: 'auto',
                              width: '100%'
                            }}
                            alt={item.title}
                          />
                        </div>
                      )}
                    </div>
                    <div className='flex flex-col gap-y-2'>
                      <h3 className='text-base font-semibold text-black'>
                        {item.title}
                      </h3>
                      <div className='relative sm:hidden block md:block lg:hidden'>
                        {item.url ? (
                          <a
                            href={`https://${item.url}`}
                            className='h-auto w-full block'
                          >
                            <Image
                              src={item.img}
                              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                              className='rounded-lg shadow-xl'
                              width={1}
                              height={1}
                              style={{
                                height: 'auto',
                                width: '100%'
                              }}
                              alt={item.title}
                            />
                          </a>
                        ) : (
                          <div className='h-auto w-full block'>
                            <Image
                              src={item.img}
                              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                              className='rounded-lg shadow-xl'
                              width={1}
                              height={1}
                              style={{
                                height: 'auto',
                                width: '100%'
                              }}
                              alt={item.title}
                            />
                          </div>
                        )}
                      </div>
                      <div className='flex flex-col gap-y-1'>
                        <p className='text-sm font-normal text-black'>
                          {item.desc}
                        </p>
                        {item.url && (
                          <div className='block relative'>
                            <a
                              href={`https://${item.url}`}
                              className='text-sm font-normal no-underline hover:underline text-violet-600 inline-flex items-center gap-x-2'
                            >
                              <LinkIcon height={16} />
                              {item.url}
                            </a>
                          </div>
                        )}

                        {item.github && (
                          <div className='block relative'>
                            <a
                              href={item.github}
                              className='text-sm font-normal no-underline hover:underline text-violet-600 inline-flex items-end gap-x-2'
                            >
                              <Image
                                src='/images/icons/github.png'
                                width={24}
                                height={24}
                                alt={`${item.title} GitHub`}
                              />
                              <span>GitHub</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {activeCategory === 2 &&
                workExperiences.map((item) => (
                  <div
                    key={item.company}
                    className='flex gap-x-10 w-full h-auto'
                  >
                    <div className='relative'>
                      <div className='h-auto w-24 block'>
                        <Image
                          src={item.logo}
                          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                          className='rounded-2xl'
                          width={1}
                          height={1}
                          style={{
                            height: 'auto',
                            width: '100%'
                          }}
                          alt={item.company}
                        />
                      </div>
                    </div>
                    <div className='flex flex-col gap-y-2'>
                      <div className='flex flex-col'>
                        <h2 className='text-base font-semibold text-black'>
                          {item.company}
                        </h2>
                        <h5 className='text-xs font-normal text-gray-600'>
                          {item.startDate} -{' '}
                          {item.isPresent ? 'Present' : item.endDate}
                        </h5>
                      </div>
                      {item.projects.map((project) => (
                        <div
                          key={project.name}
                          className='flex flex-col gap-y-2'
                        >
                          <h3 className='text-sm font-medium text-black'>
                            {project.title}
                          </h3>
                          <ul className='flex flex-col gap-y-1 list-disc'>
                            {project.desc.map((desc: string, i: number) => (
                              <li
                                key={i}
                                className='text-sm font-normal text-gray-800'
                              >
                                {desc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

              {activeCategory === 3 &&
                education.certificates.map((certificate) => (
                  <div
                    key={certificate.title}
                    className='flex sm:gap-x-10 w-full h-auto'
                  >
                    <div className='relative sm:block md:hidden lg:block hidden'>
                      <a
                        href={`https://ude.my/${certificate.credentialID}`}
                        className='h-auto w-52 block'
                      >
                        <Image
                          src={`/images/education/${certificate.credentialID}.jpg`}
                          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                          className='rounded-lg shadow-xl'
                          width={1}
                          height={1}
                          style={{
                            height: 'auto',
                            width: '100%'
                          }}
                          alt={certificate.title}
                        />
                      </a>
                    </div>
                    <div className='flex flex-col gap-y-2'>
                      <h3 className='text-base font-semibold text-black'>
                        {certificate.title}
                      </h3>
                      <div className='relative block sm:hidden md:block lg:hidden'>
                        <a
                          href={`https://ude.my/${certificate.credentialID}`}
                          className='h-auto w-full block'
                        >
                          <Image
                            src={`/images/education/${certificate.credentialID}.jpg`}
                            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                            className='rounded-lg shadow-xl'
                            width={1}
                            height={1}
                            style={{
                              height: 'auto',
                              width: '100%'
                            }}
                            alt={certificate.title}
                          />
                        </a>
                      </div>
                      <div className='block relative'>
                        <a
                          href={`https://ude.my/${certificate.credentialID}`}
                          className='text-sm font-normal no-underline hover:underline text-violet-600 inline-flex items-center gap-x-2'
                        >
                          <LinkIcon height={16} />
                          {certificate.credentialID}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className='flex items-center flex-col justify-center gap-y-2 flex-1 bg-white/95'>
              <h2 className='text-base font-medium text-slate-800'>
                Nothing to see here.
              </h2>
              <p className='text-xs font-normal text-slate-700'>
                Please select one of the sidebar categories.
              </p>
            </div>
          )}
        </div>
        {/* end */}
      </div>
    </main>
  )
}

export default Portfolio
