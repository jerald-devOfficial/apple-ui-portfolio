'use client'

import { EthereumIcon } from '@/components/svg-icons'
import { LuLoader } from 'react-icons/lu'
import { RiLineChartLine } from 'react-icons/ri'

type WalletBalanceProps = {
  balance: string | null
  usdBalance: string | null
  isLoading: boolean
  error: string | null
}

const NO_PRICE = 'Price unavailable'

/**
 * The balance readout shared by both wallet panels.
 *
 * Every state is rendered here rather than in each panel: while the two had
 * their own copies, a fix to one of them left the other reporting `0 ETH` and
 * `$0.00 USD` under an error banner.
 */
const WalletBalance = ({
  balance,
  usdBalance,
  isLoading,
  error
}: WalletBalanceProps) => {
  if (error) {
    return (
      <div className="my-4 flex flex-col items-center gap-y-10">
        <p className="text-xs font-medium text-center text-rose-600 dark:text-rose-400">
          Balance unavailable: {error}
        </p>
      </div>
    )
  }

  // A known balance with no price is still worth showing, so the headline falls
  // back to ETH instead of a `$0.00` that reads as an empty wallet.
  const headline = usdBalance ? `${usdBalance} USD` : `${balance ?? '0'} ETH`

  return (
    <div className="my-4 flex flex-col items-center gap-y-10">
      {isLoading ? (
        <h3 className="text-3xl font-medium text-center w-full flex gap-x-2 items-center justify-center text-black dark:text-white">
          $ <LuLoader className="animate-spin" />
        </h3>
      ) : (
        <h3 className="font-medium text-3xl text-black dark:text-white">
          {headline}
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
              <div className="-top-1 right-0 absolute rounded-full bg-gray-50 dark:bg-zinc-900 p-0.5">
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
              {isLoading ? '...' : `${balance ?? '0'} ETH`}
            </span>
            <span className="dark:text-gray-300">
              {isLoading ? '...' : usdBalance ? `${usdBalance} USD` : NO_PRICE}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletBalance
