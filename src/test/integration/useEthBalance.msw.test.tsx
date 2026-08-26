import useEthBalance from '@/hooks/useEthBalance'
import { TEST_ORIGIN } from '@/test/handlerRequest'
import { toMockRestHttpHandlers } from '@/test/mock-rest/mswAdapter'
import { mswServer } from '@/test/msw/nodeServer'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { beforeEach, describe, expect, it } from 'vitest'

const ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

const makeWrapper = (overrides: Record<string, unknown> = {}) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <SWRConfig
      value={{
        provider: () => new Map(),
        dedupingInterval: 0,
        revalidateOnFocus: false,
        ...overrides
      }}
    >
      {children}
    </SWRConfig>
  )

  Wrapper.displayName = 'SwrTestWrapper'

  return Wrapper
}

const wrapper = makeWrapper()

const balanceReturns = (body: unknown, status = 200) =>
  mswServer.use(
    http.get(`${TEST_ORIGIN}/api/eth-balance`, () =>
      HttpResponse.json(body as Record<string, unknown>, { status })
    )
  )

beforeEach(() => {
  mswServer.use(...toMockRestHttpHandlers(TEST_ORIGIN))
})

describe('useEthBalance', () => {
  it('renders a dust balance the way MetaMask does', async () => {
    const { result } = renderHook(() => useEthBalance(ADDRESS), { wrapper })

    await waitFor(() => expect(result.current.usdBalance).not.toBeNull())

    // The catalog fixture holds 0.000006739061868 ETH at $3421.55.
    expect(result.current.balance).toBe('<0.00001')
    expect(result.current.usdBalance).toBe('$0.02')
    expect(result.current.error).toBeNull()
  })

  it('does not fetch without an address', async () => {
    const { result } = renderHook(() => useEthBalance(undefined), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.balance).toBeNull()
    expect(result.current.usdBalance).toBeNull()
  })

  /**
   * A truthiness check on the balance used to treat a real zero as "not loaded
   * yet", so an empty wallet never requested a price and rendered the fallback.
   */
  it('still prices a genuinely empty wallet', async () => {
    balanceReturns({ address: ADDRESS, wei: '0', eth: 0 })

    const { result } = renderHook(() => useEthBalance(ADDRESS), { wrapper })

    await waitFor(() => expect(result.current.balance).not.toBeNull())

    expect(result.current.balance).toBe('0')
    await waitFor(() => expect(result.current.usdBalance).toBe('$0.00'))
  })

  it('surfaces the proxy message instead of reporting an empty wallet', async () => {
    balanceReturns({ msg: 'Failed to fetch balance from Etherscan' }, 502)

    const { result } = renderHook(() => useEthBalance(ADDRESS), { wrapper })

    await waitFor(() => expect(result.current.error).not.toBeNull())

    expect(result.current.error).toBe('Failed to fetch balance from Etherscan')
    expect(result.current.balance).toBeNull()
    expect(result.current.usdBalance).toBeNull()
  })

  it('rejects a response that does not match the contract', async () => {
    balanceReturns({ address: ADDRESS, wei: '0' })

    const { result } = renderHook(() => useEthBalance(ADDRESS), { wrapper })

    await waitFor(() => expect(result.current.error).not.toBeNull())

    expect(result.current.error).toBe('Unexpected balance response')
  })

  it('reports the balance even when the price lookup fails', async () => {
    mswServer.use(
      http.get(`${TEST_ORIGIN}/api/eth-usd`, () =>
        HttpResponse.json(
          { msg: 'Error fetching ETH-USD price' },
          { status: 500 }
        )
      )
    )

    const { result } = renderHook(() => useEthBalance(ADDRESS), { wrapper })

    await waitFor(() => expect(result.current.balance).not.toBeNull())

    expect(result.current.balance).toBe('<0.00001')
    expect(result.current.usdBalance).toBeNull()
  })

  /**
   * SWR keeps retrying a rejected request, and each attempt turns `isLoading`
   * back on. Reporting that as loading would swap the panel back to a spinner
   * every few seconds for as long as the endpoint stays down.
   */
  it('keeps the ETH figure steady while the price lookup retries', async () => {
    let rateRequests = 0

    mswServer.use(
      http.get(`${TEST_ORIGIN}/api/eth-usd`, () => {
        rateRequests += 1
        return HttpResponse.json({ msg: 'No price' }, { status: 500 })
      })
    )

    const seen: boolean[] = []
    const { result } = renderHook(
      () => {
        const value = useEthBalance(ADDRESS)
        seen.push(value.isLoading)
        return value
      },
      { wrapper: makeWrapper({ errorRetryInterval: 20 }) }
    )

    await waitFor(() => expect(result.current.balance).not.toBeNull())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    seen.length = 0
    await waitFor(() => expect(rateRequests).toBeGreaterThan(1))

    expect(seen).not.toContain(true)
  })

  it('keeps the failure message steady while the balance request retries', async () => {
    let balanceRequests = 0

    mswServer.use(
      http.get(`${TEST_ORIGIN}/api/eth-balance`, () => {
        balanceRequests += 1
        return HttpResponse.json({ msg: 'Etherscan is down' }, { status: 502 })
      })
    )

    const seen: boolean[] = []
    const { result } = renderHook(
      () => {
        const value = useEthBalance(ADDRESS)
        seen.push(value.isLoading)
        return value
      },
      { wrapper: makeWrapper({ errorRetryInterval: 20 }) }
    )

    await waitFor(() => expect(result.current.error).not.toBeNull())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    seen.length = 0
    await waitFor(() => expect(balanceRequests).toBeGreaterThan(1))

    expect(seen).not.toContain(true)
  })
})
