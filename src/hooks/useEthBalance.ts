import { fetchExchangeRateFromAPI } from '@/utils'
import useSWR from 'swr'

const fetchEthBalance = async (address: string) => {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
  const res = await fetch(
    `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
  )
  const data = await res.json()
  if (data.status === '1') {
    // Convert from wei to ETH
    return parseFloat(data.result) / 1e18
  } else {
    throw new Error('Failed to fetch balance')
  }
}

const fetchUsdBalance = async (eth: number) => {
  const ethToUsd = await fetchExchangeRateFromAPI()
  return (eth * ethToUsd).toFixed(2)
}

const useEthBalance = (address?: string) => {
  const shouldFetch = Boolean(address)
  const {
    data: ethBalance,
    error,
    isLoading
  } = useSWR(shouldFetch ? ['eth-balance', address] : null, () =>
    fetchEthBalance(address!)
  )

  // Use SWR for USD balance, only if ethBalance is available
  const { data: usdBalance, isValidating: isLoadingUsd } = useSWR(
    ethBalance ? ['eth-usd-balance', ethBalance] : null,
    () => fetchUsdBalance(Number(ethBalance))
  )

  return {
    balance: ethBalance ? ethBalance.toFixed(4) : null,
    usdBalance,
    isLoading: isLoading || isLoadingUsd,
    error: error ? error.message : null
  }
}

export default useEthBalance
