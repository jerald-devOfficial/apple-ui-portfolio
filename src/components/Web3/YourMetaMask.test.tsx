import YourMetaMask from '@/components/Web3/YourMetaMask'
import { TEST_ORIGIN } from '@/test/handlerRequest'
import { toMockRestHttpHandlers } from '@/test/mock-rest/mswAdapter'
import { mswServer } from '@/test/msw/nodeServer'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

type InjectedWindow = Window & { ethereum?: unknown }

const request = vi.fn()

const installProvider = () => {
  ;(window as InjectedWindow).ethereum = {
    request,
    on: vi.fn(),
    removeListener: vi.fn()
  }
}

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

const renderPanel = () => render(<YourMetaMask />, { wrapper })

beforeEach(() => {
  vi.clearAllMocks()
  request.mockResolvedValue([])
  mswServer.use(...toMockRestHttpHandlers(TEST_ORIGIN))
})

afterEach(() => {
  delete (window as InjectedWindow).ethereum
})

describe('YourMetaMask', () => {
  it('explains how to install the extension when it is missing', async () => {
    renderPanel()

    expect(
      screen.getByText(
        'MetaMask browser extension not detected or not connected.'
      )
    ).toBeVisible()
    expect(
      screen.getByText('Have MetaMask browser extension installed.')
    ).toBeVisible()
    expect(
      screen.queryByRole('button', { name: /connect/i })
    ).not.toBeInTheDocument()
  })

  it('offers to connect when the extension is installed but not authorised', async () => {
    installProvider()

    renderPanel()

    expect(
      await screen.findByRole('button', { name: 'Connect MetaMask' })
    ).toBeEnabled()
    expect(
      screen.queryByText(
        'MetaMask browser extension not detected or not connected.'
      )
    ).not.toBeInTheDocument()
  })

  it('shows the balance after the visitor authorises the account', async () => {
    installProvider()

    renderPanel()

    const connect = await screen.findByRole('button', {
      name: 'Connect MetaMask'
    })

    request.mockResolvedValue([ADDRESS])
    await userEvent.click(connect)

    expect(
      await screen.findByRole('heading', { name: '$0.02 USD' })
    ).toBeVisible()
    expect(screen.getByText('<0.00001 ETH')).toBeVisible()
  })

  it('shows the balance straight away for an already authorised account', async () => {
    installProvider()
    request.mockResolvedValue([ADDRESS])

    renderPanel()

    expect(
      await screen.findByRole('heading', { name: '$0.02 USD' })
    ).toBeVisible()
    expect(screen.getByText('0xd8dA...A96045')).toBeVisible()
  })

  it('reports a failed lookup instead of an empty wallet', async () => {
    installProvider()
    request.mockResolvedValue([ADDRESS])
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
})
