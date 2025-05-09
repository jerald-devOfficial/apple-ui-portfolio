'use client'

import { EthereumIcon } from '@/components/svg-icons'
import {
  copyAddressToClipboard,
  fetchExchangeRateFromAPI,
  hashShortener,
  toFixedFour
} from '@/utils'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { BiSolidCopy } from 'react-icons/bi'
import { HiOutlineEllipsisVertical } from 'react-icons/hi2'
import { LuLoader } from 'react-icons/lu'
import { RiLineChartLine } from 'react-icons/ri'
import { formatEther } from 'viem'
import { useAccount, useBalance } from 'wagmi'

const YourMetaMask = () => {
  const { address, isConnected } = useAccount()
  const { data: balanceData, isLoading: isLoadingBalance } = useBalance({
    address
  })

  const [error, setError] = useState<null | string>(null)

  useEffect(() => {
    if (!isConnected) {
      setError('MetaMask browser extension not detected or not connected.')
    } else {
      setError(null)
    }
  }, [isConnected])

  const fetchBalanceUSD = async () => {
    if (balanceData) {
      const ethToUSD = await fetchExchangeRateFromAPI()
      return (parseFloat(formatEther(balanceData.value)) * ethToUSD).toFixed(2)
    }
    return '0.00'
  }

  const { data: balanceUSD = '0.00' } = useQuery({
    queryKey: ['balanceUSD', balanceData?.value?.toString() || '0'],
    queryFn: fetchBalanceUSD,
    enabled: !!balanceData
  })

  return (
    <section className="grow h-full bg-white dark:bg-zinc-900">
      <div className="h-16 w-full shadow-md shadow-gray-200 dark:shadow-zinc-800 flex justify-between items-center px-4 bg-white dark:bg-zinc-900">
        {error && (
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
        {isConnected && address ? (
          <>
            <span className="rounded-full bg-gray-100 dark:bg-zinc-800 border border-solid border-gray-200 dark:border-zinc-700 py-2 px-4">
              <EthereumIcon className="h-3 w-3" />
            </span>
            <div className="flex flex-col items-center gap-y-1.5">
              <span className="text-xs font-bold dark:text-white">Account</span>
              <div className="flex items-center gap-x-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {hashShortener(address, 6)}
                </span>
                <BiSolidCopy
                  onClick={() => copyAddressToClipboard(address)}
                  size={16}
                  className="text-gray-600 dark:text-gray-300"
                />
              </div>
            </div>
            <HiOutlineEllipsisVertical
              size={20}
              className="text-gray-600 dark:text-gray-300"
            />
          </>
        ) : null}
      </div>
      <div className="flex flex-col px-4 py-6">
        {error && (
          <div className="overflow-x-hidden overflow-y-auto px-4 space-y-2">
            <p className="text-xs font-medium text-left text-wrap leading-6 text-blue-600 dark:text-blue-400">
              Please make sure to:
            </p>
            <ul className="indent-1 text-xs list-inside list-decimal leading-6 dark:text-gray-300">
              <li>
                Access this site using a desktop browser, not from a mobile
                device.
              </li>
              <li>Have MetaMask browser extension installed.</li>
              <li>Once installed, login to your MetaMask account.</li>
              <li>
                Allow{' '}
                <code className="text-violet-600 dark:text-violet-400">
                  jeraldbaroro.xyz
                </code>{' '}
                to have read-only access to your profile
              </li>
              <li>{`And it will display your MetaMask here.`}</li>
            </ul>
          </div>
        )}
        {isConnected && address ? (
          <div className="my-4 flex flex-col items-center gap-y-10">
            {isLoadingBalance ? (
              <h3 className="text-3xl font-medium text-center w-full flex gap-x-2 items-center justify-center text-black dark:text-white">
                $ <LuLoader className="animate-spin" />
              </h3>
            ) : (
              <h3 className="font-medium text-3xl text-black dark:text-white">
                ${balanceUSD} USD
              </h3>
            )}
            <div className="grid place-items-center gap-1">
              <span className="bg-sky-600 rounded-full p-2">
                <RiLineChartLine className="text-white" size={20} />
              </span>
              <span className="text-xs text-black dark:text-white font-medium">
                Portfolio
              </span>
            </div>
            <div className="flex flex-col gap-y-4 w-full">
              <div className="grid grid-cols-3">
                <div className="border-b-2 border-solid border-sky-600 flex items-center justify-center pb-1.5">
                  <span className="text-xs text-sky-600 dark:text-sky-400">
                    Tokens
                  </span>
                </div>
              </div>
              <div className="text-xs font-normal text-gray-800 dark:text-gray-200 flex items-center justify-between">
                <div className="flex gap-x-2 items-start">
                  <div className="rounded-full block bg-gray-200 dark:bg-zinc-800 p-1.5 relative">
                    <EthereumIcon className="h-3.5 w-3.5" />
                    <div className="-top-1 -right-0 absolute rounded-full bg-gray-50 dark:bg-zinc-900 p-0.5">
                      <EthereumIcon className="h-2 w-2" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <span className="dark:text-white">ETH</span>
                    <span className="dark:text-gray-300">Ethereum</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-y-1">
                  <span className="dark:text-white">
                    {toFixedFour(formatEther(balanceData?.value ?? BigInt(0)))}{' '}
                    ETH
                  </span>
                  <span className="dark:text-gray-300">${balanceUSD} USD</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default YourMetaMask
