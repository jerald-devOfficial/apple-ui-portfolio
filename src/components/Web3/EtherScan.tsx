'use client'

import { hashShortener, toFixedFour } from '@/utils'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import { FormEvent, useState } from 'react'
import { IoSearchSharp } from 'react-icons/io5'
import Web3 from 'web3'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

type Transaction = {
  blockHash?: string
  from: string
  to?: string | null
  value: string
  gas: string
  gasPrice: string
  hash: string
  nonce: string
  blockNumber?: string
  transactionIndex?: string
  input: string
  v?: string
  r: string
  s: string
}

const EtherScan = () => {
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [transactionHash, setTransactionHash] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const fetchTransaction = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setIsSubmitted(true)

    try {
      const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
      const response = await fetch(
        `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${transactionHash}&apikey=${apiKey}`
      )
      const data = await response.json()

      if (data.result) {
        setTransaction(data.result)
      } else {
        setError('Transaction not found.')
      }
    } catch (error) {
      console.error('Error fetching transaction:', error)
      setError('An error occurred while fetching the transaction.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setTransaction(null)
    setTransactionHash('')
    setIsSubmitted(false)
    setError(null)
  }

  return (
    <section className="h-full bg-white dark:bg-zinc-900 flex flex-col w-full">
      <div className="h-16 w-full shadow-md overflow-hidden shadow-gray-200 dark:shadow-zinc-800 hidden sm:flex justify-start items-center px-4">
        <div className="block w-2/5 h-auto">
          <Image
            src="/images/web3/etherscan.png"
            alt="EtherScan logo"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            width={1}
            height={1}
            style={{
              height: 'auto',
              width: '100%'
            }}
          />
        </div>
      </div>
      <div className="flex flex-col flex-1 gap-y-4">
        <div className="h-[100px] bg-linear-to-b from-eth-bg-top to-eth-bg-bottom relative overflow-hidden w-full flex">
          <div className="absolute overflow-hidden inset-0 h-[inherit] wave px-4 flex grow justify-center items-center w-full">
            <form
              onSubmit={fetchTransaction}
              className="flex w-full h-8 bg-white dark:bg-zinc-800 items-center rounded-md p-1 gap-x-2 justify-between"
            >
              <div className="relative flex items-center justify-center flex-1 h-[inherit] overflow-hidden">
                <input
                  type="text"
                  className={`${inter.className} absolute block m-auto text-sm flex-1 focus:rounded-md p-2 focus:outline-gray-400 text-black dark:text-white w-full outline-hidden placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                  placeholder="Enter Transaction Hash"
                />
              </div>
              <button
                className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-1 px-1.5 rounded-md flex items-center justify-center"
                type="submit"
              >
                <IoSearchSharp />
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className="flex flex-col justify-between flex-1 p-4">
            <div className="flex flex-col gap-y-2">
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                {error}
              </p>
            </div>
            <button
              className="rounded-md flex items-center justify-center px-2 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-medium"
              onClick={handleClear}
            >
              New Transaction Search
            </button>
          </div>
        )}

        {isLoading && (
          <p className="text-xs font-bold flex-1 text-yellow-600 dark:text-yellow-400 text-center w-full">
            Fetching data from Etherscan...
          </p>
        )}

        {!isSubmitted && (
          <div className="overflow-x-hidden overflow-y-auto px-4 space-y-2">
            <p className="text-sm font-medium dark:text-white">
              To test this feature
            </p>
            <ul className="indent-1 text-sm list-inside list-decimal leading-6 dark:text-gray-300">
              <li>
                Go to:{' '}
                <a
                  href="https://etherscan.io/txs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-500 font-medium"
                >
                  etherscan.io/txs
                </a>
              </li>
              <li>
                Select any of <strong>Txn Hash</strong>
              </li>
              <li>Copy the hash address</li>
              <li>Paste the Txn Hash here in the input field</li>
              <li>Submit and go</li>
            </ul>
          </div>
        )}

        {!isLoading && transaction ? (
          <div className="flex justify-between flex-col flex-1 p-4">
            <div className={`${inter.className} flex flex-col gap-y-2`}>
              <h4 className="text-base font-medium dark:text-white">
                Transaction Details
              </h4>
              <div className="flex gap-x-4 text-sm">
                <div className="flex flex-col text-gray-500 dark:text-gray-300">
                  <span className="text-nowrap">Transaction Hash:</span>
                  <span>From:</span>
                  <span>To:</span>
                  <span>Value:</span>
                </div>
                <div className="flex flex-col flex-1 dark:text-white">
                  <span>{hashShortener(transaction.blockHash ?? '', 10)}</span>
                  <span>{hashShortener(transaction.from ?? '', 10)}</span>
                  <span>{hashShortener(transaction.to ?? '', 10)}</span>
                  <span>
                    {toFixedFour(
                      Web3.utils.fromWei(transaction.value, 'ether')
                    )}{' '}
                    ETH
                  </span>
                </div>
              </div>
            </div>
            <button
              className="rounded-md flex items-center justify-center px-2 py-1 text-sm text-white bg-blue-600 font-medium"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default EtherScan
