'use client'

import { hashShortener, toFixedFour } from '@/utils'
import { Inter } from 'next/font/google'
import React, { FormEvent, useState } from 'react'
import { IoSearchSharp } from 'react-icons/io5'
import Image from 'next/image'
import Web3 from 'web3'
const inter = Inter({ subsets: ['latin'], display: 'swap' })

const EtherScan = () => {
  const [transaction, setTransaction] = useState<any>(null)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [transactionHash, setTransactionHash] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const fetchTransaction = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitted(true)

    try {
      setIsLoading(true)
      if (
        typeof window !== 'undefined' &&
        (window as any).ethereum !== 'undefined'
      ) {
        // Initialize web3 with MetaMask provider
        const web3 = new Web3((window as any).ethereum)
        // Request account access if needed
        await (window as any).ethereum.enable()

        // Fetch transaction details
        const transaction = await web3.eth.getTransaction(transactionHash)
        setTransaction(transaction)
      } else {
        console.error('MetaMask extension not detected.')
        setError('MetaMask browser extension not detected, please install.')
      }
    } catch (error) {
      console.error('Error fetching transaction:', error)
      setError(`Error from fetching transaction: ${error}`)
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
    <section className='h-full bg-white flex flex-col w-full'>
      <div className='h-16 w-full shadow-md overflow-hidden shadow-gray-200 hidden sm:flex justify-start items-center px-4'>
        <div className='block w-2/5 h-auto'>
          <Image
            src='/images/web3/etherscan.png'
            alt='EtherScan logo'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            width={1}
            height={1}
            style={{
              height: 'auto',
              width: '100%'
            }}
          />
        </div>
      </div>
      <div className='flex flex-col flex-1 gap-y-4'>
        <div className='h-[100px] bg-gradient-to-b from-eth-bg-top to-eth-bg-bottom relative overflow-hidden w-full flex'>
          <div className='absolute overflow-hidden inset-0 h-[inherit] wave px-4 flex flex-grow justify-center items-center w-full'>
            <form
              onSubmit={fetchTransaction}
              className='flex w-full h-8 bg-white items-center rounded-md p-1 gap-x-2 justify-between'
            >
              <div className='relative flex items-center justify-center flex-1 h-[inherit] overflow-hidden'>
                <input
                  type='text'
                  className={`${inter.className} absolute block m-auto text-sm flex-1 focus:rounded-md p-2 focus:outline-gray-400 text-black w-full outline-none`}
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                  placeholder='Enter Transaction Hash'
                />
              </div>
              <button
                className='bg-sky-500 hover:bg-sky-600 text-white font-semibold py-1 px-1.5 rounded-md flex items-center justify-center'
                type='submit'
              >
                <IoSearchSharp />
              </button>
            </form>
          </div>
        </div>
        {error && (
          <div className='flex flex-col justify-between flex-1 p-4'>
            <p className='text-xs font-bold text-rose-600'>{error}</p>
            <button
              className='rounded-md flex items-center justify-center px-2 py-1 text-sm text-white bg-blue-600 font-medium'
              onClick={handleClear}
            >
              New Transaction Search
            </button>
          </div>
        )}
        {isLoading && (
          <p className='text-xs font-bold flex-1 text-yellow-600 text-center w-full'>
            Fetching data from https://etherscan.io...
          </p>
        )}

        {!isSubmitted && (
          <div className='overflow-x-hidden overflow-y-auto px-4 space-y-2'>
            <p className='text-sm font-medium'>To test this feature</p>
            <ul className='indent-1 text-sm list-inside list-decimal leading-6'>
              <li>
                Go to:{' '}
                <a
                  href='https://etherscan.io/txs'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-violet-500 font-medium'
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
          <div className='flex justify-between flex-col flex-1 p-4'>
            <div className={`${inter.className} flex flex-col gap-y-2`}>
              <h4 className='text-base font-medium'>Transcation Details</h4>
              <div className='flex gap-x-4 text-sm'>
                <div className='flex flex-col text-gray-500'>
                  <span className='text-nowrap'>Transaction Hash:</span>
                  <span>From:</span>
                  <span>To:</span>
                  <span>Value:</span>
                </div>

                <div className='flex flex-col flex-1'>
                  <span>{hashShortener(transaction.blockHash, 10)}</span>
                  <span>{hashShortener(transaction.from, 10)}</span>
                  <span>{hashShortener(transaction.to, 10)}</span>
                  <span>
                    {toFixedFour(
                      Web3.utils.fromWei(transaction.value.toString(), 'ether')
                    )}{' '}
                    ETH
                  </span>
                </div>
              </div>
            </div>
            <button
              className='rounded-md flex items-center justify-center px-2 py-1 text-sm text-white bg-blue-600 font-medium'
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
