'use client'

import EtherScan from '@/components/Web3/EtherScan'
import MyMetaMask from '@/components/Web3/MyMetaMask'
import YourMetaMask from '@/components/Web3/YourMetaMask'
import { ChevronLeftIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { useState } from 'react'

const sides = [
  {
    title: 'My MetaMask',
    logo: '/images/web3/my-metamask.png',
    component: MyMetaMask
  },
  {
    title: 'Your MetaMask',
    logo: '/images/web3/your-metamask.png',
    component: YourMetaMask
  },
  {
    title: 'EtherScan Transactions',
    logo: '/images/web3/etherscan.png',
    component: EtherScan
  }
]

const EmptyMobilePanel = () => null

const Web3 = () => {
  const [activeCategory, setActiveCategory] = useState<number>(0)
  const [mobileCategory, setMobileCategory] = useState<number | null>(null)

  const ActiveComponent = sides[activeCategory].component
  const MobileComponent =
    mobileCategory !== null ? sides[mobileCategory].component : EmptyMobilePanel

  return (
    <div className="flex grow h-full rounded-xl shadow-xl overflow-hidden bg-white/90 dark:bg-zinc-900">
      <section className="md:w-75 sm:w-50 w-full h-full flex flex-col dark:bg-zinc-900">
        <div className="border-b border-gray-300 dark:border-zinc-700 border-solid h-16 hover:bg-white/90 dark:hover:bg-zinc-800 flex items-center justify-between px-4 shadow-md shadow-gray-200 dark:shadow-zinc-800 w-full overflow-hidden">
          <div className="hidden sm:block overflow-hidden md:w-2/3 h-auto sm:w-full">
            <Image
              src={sides[activeCategory].logo}
              alt={sides[activeCategory].title}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              width={1}
              height={1}
              // The panel header sits at the top of the window, so this logo is
              // the LCP element; lazy loading it delays the metric.
              priority
              style={{
                height: 'auto',
                width: '100%'
              }}
            />
          </div>
          {mobileCategory !== null ? (
            <div className="block sm:hidden overflow-hidden w-2/5 h-auto">
              <Image
                src={sides[mobileCategory].logo}
                alt={sides[mobileCategory].title}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                width={1}
                height={1}
                style={{
                  height: 'auto',
                  width: '100%'
                }}
              />
            </div>
          ) : (
            <h3 className="block sm:hidden dark:text-white">
              Web3 Mini Projects
            </h3>
          )}
          {mobileCategory !== null ? (
            <button
              className="text-blue-600 dark:text-blue-400 flex sm:hidden items-center gap-x-1 "
              onClick={() => setMobileCategory(null)}
            >
              <ChevronLeftIcon className="h-4 w-4" />{' '}
              <span className="xs:text-base text-sm">Back</span>
            </button>
          ) : null}
        </div>

        <div className="mt-6 mx-4 pl-4 rounded-xl border border-solid border-gray-300 dark:border-zinc-700 hidden sm:block">
          {sides.map((item, index) => (
            <button
              key={item.title}
              className={`flex justify-between py-3.5 pr-3 md:items-center sm:items-start w-full group ${
                index < sides.length - 1
                  ? 'border-b border-gray-300 dark:border-zinc-700 border-solid'
                  : ''
              }`}
              onClick={() => setActiveCategory(index)}
            >
              <h4
                className={`md:text-base sm:text-sm text-start ${
                  activeCategory === index
                    ? 'text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-400 dark:group-hover:text-blue-300'
                    : 'font-normal text-black dark:text-white group-hover:text-gray-500 dark:group-hover:text-gray-300'
                }`}
              >
                {item.title}
              </h4>
            </button>
          ))}
        </div>
        {mobileCategory !== null ? (
          <div className="block sm:hidden h-full w-full">
            <MobileComponent />
          </div>
        ) : (
          <div className="mt-6 mx-4 pl-4 rounded-xl border border-solid border-gray-300 dark:border-zinc-700 block sm:hidden">
            {sides.map((item, index) => (
              <button
                key={item.title}
                className={`flex justify-between py-3.5 pr-3 md:items-center sm:items-start w-full group ${
                  index < sides.length - 1
                    ? 'border-b border-gray-300 dark:border-zinc-700 border-solid'
                    : ''
                }`}
                onClick={() => setMobileCategory(index)}
              >
                <h4
                  className={`md:text-base sm:text-sm text-start ${
                    mobileCategory === index
                      ? 'text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-400 dark:group-hover:text-blue-300'
                      : 'font-normal text-black dark:text-white group-hover:text-gray-500 dark:group-hover:text-gray-300'
                  }`}
                >
                  {item.title}
                </h4>
              </button>
            ))}
          </div>
        )}
      </section>
      <div className="hidden sm:flex flex-1">
        <ActiveComponent />
      </div>
    </div>
  )
}

export default Web3
