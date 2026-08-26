import MyMetaMask from '@/components/Web3/MyMetaMask'
import { TEST_ORIGIN } from '@/test/handlerRequest'
import { toMockRestHttpHandlers } from '@/test/mock-rest/mswAdapter'
import { mswServer } from '@/test/msw/nodeServer'
import { render, screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig
    value={{
      provider: () => new Map(),
      dedupingInterval: 0,
      revalidateOnFocus: false
    }}
  >
    {children}
  </SWRConfig>
)

const renderPanel = () => render(<MyMetaMask />, { wrapper })

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_METAMASK_ADDRESS', ADDRESS)
  mswServer.use(...toMockRestHttpHandlers(TEST_ORIGIN))
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('MyMetaMask', () => {
  it('shows the configured wallet balance', async () => {
    renderPanel()

    expect(
      await screen.findByRole('heading', { name: '$0.02 USD' })
    ).toBeVisible()
    expect(screen.getByText('<0.00001 ETH')).toBeVisible()
    expect(screen.getByText('0xd8dA...A96045')).toBeVisible()
  })

  /**
   * The panel used to render its `$0.00` fallback whenever the balance request
   * failed, which is indistinguishable from an empty wallet.
   */
  it('reports a failed lookup instead of an empty wallet', async () => {
    mswServer.use(
      http.get(`${TEST_ORIGIN}/api/eth-balance`, () =>
        HttpResponse.json(
          { msg: 'Failed to fetch balance from Etherscan' },
          { status: 502 }
        )
      )
    )

    renderPanel()

    expect(
      await screen.findByText(/Failed to fetch balance from Etherscan/)
    ).toBeVisible()
    expect(screen.queryByText('0 ETH')).not.toBeInTheDocument()
    expect(screen.queryByText('$0.00 USD')).not.toBeInTheDocument()
  })

  it('falls back to ETH when the price proxy is down', async () => {
    mswServer.use(
      http.get(`${TEST_ORIGIN}/api/eth-usd`, () =>
        HttpResponse.json(
          { msg: 'Error fetching ETH-USD price' },
          { status: 500 }
        )
      )
    )

    renderPanel()

    expect(
      await screen.findByRole('heading', { name: '<0.00001 ETH' })
    ).toBeVisible()
    expect(screen.getByText('Price unavailable')).toBeVisible()
    expect(screen.queryByText('$0.00 USD')).not.toBeInTheDocument()
  })

  it('renders nothing when no address is configured', () => {
    vi.stubEnv('NEXT_PUBLIC_METAMASK_ADDRESS', '')

    renderPanel()

    expect(screen.queryByText('Portfolio')).not.toBeInTheDocument()
  })
})
