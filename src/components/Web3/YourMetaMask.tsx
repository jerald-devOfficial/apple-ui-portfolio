'use client'

import WalletBalance from '@/components/Web3/WalletBalance'
import { EthereumIcon } from '@/components/svg-icons'
import useEthBalance from '@/hooks/useEthBalance'
import { useInjectedMetaMask } from '@/hooks/useInjectedMetaMask'
import { copyAddressToClipboard, hashShortener } from '@/utils'
import { BiSolidCopy } from 'react-icons/bi'
import { HiOutlineEllipsisVertical } from 'react-icons/hi2'

const YourMetaMask = () => {
  const {
    address,
    isConnected,
    hasProvider,
    hasResolved,
    isConnecting,
    connect,
    error
  } = useInjectedMetaMask()
  const {
    balance,
    usdBalance,
    isLoading: isLoadingBalance,
    error: balanceError
  } = useEthBalance(address)

  return (
    <section className="grow h-full bg-white dark:bg-zinc-900">
      <div className="h-16 w-full shadow-md shadow-gray-200 dark:shadow-zinc-800 flex justify-between items-center px-4 bg-white dark:bg-zinc-900">
        {error ? (
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
            {error}
          </p>
        ) : null}
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
        {error ? (
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
        ) : null}
        {hasProvider && hasResolved && !isConnected ? (
          <div className="flex flex-col items-center gap-y-4 px-4 py-8">
            <p className="text-xs text-center leading-6 text-gray-600 dark:text-gray-300">
              MetaMask is installed. Connect to show this account&apos;s ETH
              balance.
            </p>
            <button
              type="button"
              onClick={() => void connect()}
              disabled={isConnecting}
              className="rounded-full bg-sky-600 px-4 py-2 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          </div>
        ) : null}
        {isConnected && address ? (
          <WalletBalance
            balance={balance}
            usdBalance={usdBalance}
            isLoading={isLoadingBalance}
            error={balanceError}
          />
        ) : null}
      </div>
    </section>
  )
}

export default YourMetaMask
