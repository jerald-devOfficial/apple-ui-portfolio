'use client'

import WalletBalance from '@/components/Web3/WalletBalance'
import { EthereumIcon } from '@/components/svg-icons'
import useEthBalance from '@/hooks/useEthBalance'
import { copyAddressToClipboard, hashShortener } from '@/utils'
import { BiSolidCopy } from 'react-icons/bi'
import { HiOutlineEllipsisVertical } from 'react-icons/hi2'

const MyMetaMask = () => {
  const address = process.env.NEXT_PUBLIC_METAMASK_ADDRESS

  const {
    balance,
    usdBalance,
    isLoading,
    error: balanceError
  } = useEthBalance(address)

  return (
    <section className="grow h-full bg-white dark:bg-zinc-900">
      <div className="h-16 w-full shadow-md shadow-gray-200 dark:shadow-zinc-800 flex justify-between items-center px-4 bg-white dark:bg-zinc-900">
        {address ? (
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
        {address ? (
          <WalletBalance
            balance={balance}
            usdBalance={usdBalance}
            isLoading={isLoading}
            error={balanceError}
          />
        ) : null}
      </div>
    </section>
  )
}

export default MyMetaMask
