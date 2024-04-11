'use client'

import { EthereumIcon } from '@/components/svg-icons'
import {
  copyAddressToClipboard,
  fetchExchangeRateFromAPI,
  hashShortener,
  toFixedFour
} from '@/utils'
import { Inter } from 'next/font/google'
import React, { useEffect, useState, useMemo } from 'react'
import { BiSolidCopy } from 'react-icons/bi'
import { HiOutlineEllipsisVertical } from 'react-icons/hi2'
import { RiLineChartLine } from 'react-icons/ri'
import Web3 from 'web3'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const YourMetaMask = () => {
  const [accounts, setAccounts] = useState<{ address: string; name: string }[]>(
    []
  )

  const [isFound, setIsFound] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)
  const [balances, setBalances] = useState<{
    [key: string]: { balance: string; name: string; balanceUSD: string }
  }>({})

  const selectedTab = useMemo(() => 0, [])

  const tabs = [
    {
      title: 'Tokens',
      tokens: [
        {
          name: 'Ethereum',
          abbr: 'ETH',
          balance: isFound && balances[accounts[0].address].balance,
          balanceInUSD: isFound && balances[accounts[0].address].balanceUSD
        }
      ],
      enabled: true
    },
    {
      title: 'NFTs',
      enabled: false
    },
    {
      title: 'Activity',
      enabled: false
    }
  ]

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        // Check if MetaMask is installed
        setIsLoading(true)
        if (
          typeof window !== 'undefined' &&
          (window as any).ethereum !== 'undefined'
        ) {
          // Initialize web3 with MetaMask provider
          const web3 = new Web3((window as any).ethereum)
          // Request account access if needed
          await (window as any).ethereum.enable()
          // Get accounts from MetaMask
          const addresses = await web3.eth.getAccounts()
          // Dummy names, you might want to fetch real names from your server
          const accountsWithNames = addresses.map((address, index) => ({
            address,
            name: `Account ${index + 1}`
          }))
          setAccounts(accountsWithNames)

          // Get ETH balance for each account
          const balancesData: {
            [key: string]: { balance: string; name: string; balanceUSD: string }
          } = {}
          for (const account of accountsWithNames) {
            const ethBalance = await web3.eth.getBalance(account.address)
            const ethBalanceInEther = web3.utils.fromWei(ethBalance, 'ether')

            // Fetch current ETH to USD exchange rate from CoinGecko
            const ethToUSD = await fetchExchangeRateFromAPI('ethereum', 'usd')

            // Calculate balance in USD
            const balanceUSD = (
              parseFloat(ethBalanceInEther) * ethToUSD
            ).toFixed(2)

            balancesData[account.address] = {
              balance: ethBalanceInEther,
              name: 'Ethereum',
              balanceUSD
            }
          }
          setBalances(balancesData)
          setIsFound(true)
        } else {
          console.error('MetaMask extension not detected.')
          setError('MetaMask browser extension not detected.')
        }
      } catch (error) {
        console.error('Error loading MetaMask accounts:', error)
        setError('Error loading MetaMask accounts.')
      } finally {
        setIsLoading(false)
      }
    }

    loadAccounts()
  }, [])

  return (
    <section className='flex-grow h-full bg-white'>
      <div className='h-16 w-full shadow-md shadow-gray-200 flex justify-between items-center px-4'>
        {error && !isLoading && (
          <p className='text-xs font-bold text-rose-600'>{error}</p>
        )}
        {isLoading && (
          <p className='text-xs font-bold text-yellow-600 text-center w-full'>
            Fetching data from MetaMask extension...
          </p>
        )}

        {!isLoading && accounts.length > 0 ? (
          <>
            <span className='rounded-full bg-gray-100 border border-solid border-gray-200 py-2 px-4'>
              <EthereumIcon className='h-3 w-3' />
            </span>
            <div className='flex flex-col items-center gap-y-1.5'>
              <span className='text-xs font-bold'>{accounts[0].name}</span>
              {/* Display account address with copy functionality */}
              <div className='flex items-center gap-x-1'>
                <span className='text-xs font-medium text-gray-600'>
                  {hashShortener(accounts[0].address, 6)}
                </span>
                <BiSolidCopy
                  onClick={() => copyAddressToClipboard(accounts[0].address)}
                  size={16}
                  className='text-gray-600'
                />
              </div>
            </div>
            <HiOutlineEllipsisVertical size={20} />
          </>
        ) : null}
      </div>
      <div className='flex flex-col px-4 py-6'>
        {error && (
          <div className='overflow-x-hidden overflow-y-auto px-4 space-y-2'>
            <p className='text-sm font-medium text-left text-wrap leading-6 text-blue-600'>
              Please make sure to:
            </p>
            <ul className='indent-1 text-sm list-inside list-decimal leading-6'>
              <li>
                Access this site using a desktop browser, not from a mobile
                device.
              </li>
              <li>Have MetaMask browser extension installed.</li>
              <li>Once installed, login to your MetaMask account.</li>
              <li>
                Allow <strong>jeraldbaroro.xyz</strong> to have read-only access
                to your profile
              </li>
              <li>{`And it will display your MetaMask here.`}</li>
            </ul>
          </div>
        )}
        {isLoading && (
          <p className='text-xs font-bold text-yellow-600 text-center w-full'>
            Fetching data from MetaMask extension...
          </p>
        )}

        {!isLoading && accounts.length > 0 ? (
          <div className='my-4 flex flex-col items-center gap-y-10'>
            <h3 className={`font-medium text-3xl ${inter.className}`}>
              $
              {balances[accounts[0].address]
                ? balances[accounts[0].address].balanceUSD
                : 0}{' '}
              USD
            </h3>
            <div className='grid place-items-center gap-1'>
              <span className='bg-sky-600 rounded-full p-2'>
                <RiLineChartLine className='text-white' size={20} />
              </span>
              <span className='text-xs text-black font-medium'>Portfolio</span>
            </div>
            <div className='flex flex-col gap-y-4 w-full'>
              <div className='grid grid-cols-3'>
                {tabs.map((tab, index) => (
                  <div
                    className={`${
                      selectedTab === index
                        ? 'border-b-2 border-solid border-sky-600'
                        : ''
                    } ${
                      tab.enabled
                        ? 'cursor-pointer'
                        : 'pointer-events-none cursor-not-allowed'
                    } flex items-center justify-center pb-1.5`}
                    key={tab.title}
                  >
                    <span
                      className={`text-xs ${inter.className} ${
                        selectedTab === index ? 'text-sky-600' : ''
                      }`}
                    >
                      {tab.title}
                    </span>
                  </div>
                ))}
              </div>
              {tabs[selectedTab].tokens?.map((token) => (
                <div
                  className={`${inter.className} text-xs font-normal text-gray-800 flex items-center justify-between`}
                  key={token.abbr}
                >
                  <div className='flex gap-x-2 items-start'>
                    <div className='rounded-full block bg-gray-200 p-1.5 relative'>
                      <EthereumIcon className='h-3.5 w-3.5' />
                      <div className='-top-1 -right-0 absolute rounded-full bg-gray-50 p-0.5'>
                        <EthereumIcon className='h-2 w-2' />
                      </div>
                    </div>
                    <div className='flex flex-col gap-y-1'>
                      <span>{token.abbr}</span>
                      <span>{token.name}</span>
                    </div>
                  </div>

                  <div className='flex flex-col items-end gap-y-1'>
                    <span>
                      {toFixedFour(token.balance || '0')} {token.abbr}
                    </span>
                    <span>${token.balanceInUSD} USD</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default YourMetaMask
