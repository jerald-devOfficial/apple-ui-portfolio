import { ethBalanceResponseSchema } from '@/contracts/etherscan'
import { formatEthBalance, formatUsdBalance } from '@/lib/eth-format'
import { fetchExchangeRateFromAPI } from '@/utils'
import useSWR from 'swr'

const fetchEthBalance = async (address: string) => {
  const res = await fetch(
    `/api/eth-balance?address=${encodeURIComponent(address)}`
  )
  const data = await res.json()

  if (!res.ok) {
    throw new Error(
      typeof data?.msg === 'string' ? data.msg : 'Failed to fetch balance'
    )
  }

  const parsed = ethBalanceResponseSchema.safeParse(data)

  if (!parsed.success) throw new Error('Unexpected balance response')

  return parsed.data.eth
}

const useEthBalance = (address?: string) => {
  const {
    data: ethBalance,
    error: balanceError,
    isLoading: isLoadingBalance
  } = useSWR(address ? ['eth-balance', address] : null, () =>
    fetchEthBalance(address!)
  )

  // The rate is address-independent, so it is keyed on its own and shared by
  // every wallet panel rather than refetched whenever a balance changes. It is
  // keyed on the address only so the two requests can run side by side.
  const {
    data: ethToUsd,
    error: rateError,
    isLoading: isLoadingRate
  } = useSWR(address ? 'eth-usd-rate' : null, fetchExchangeRateFromAPI)

  const hasBalance = ethBalance !== undefined
  const hasRate = typeof ethToUsd === 'number'

  /**
   * SWR retries a rejected request indefinitely and turns `isLoading` back on
   * for each attempt. Reporting that as loading would swap the panel back to a
   * spinner every few seconds while an endpoint is down, so a request that has
   * already failed counts as settled.
   */
  const isLoading =
    (isLoadingBalance && !balanceError) || (isLoadingRate && !rateError)

  return {
    balance: hasBalance ? formatEthBalance(ethBalance) : null,
    usdBalance:
      hasBalance && hasRate ? formatUsdBalance(ethBalance * ethToUsd) : null,
    isLoading,
    error: balanceError instanceof Error ? balanceError.message : null
  }
}

export default useEthBalance
