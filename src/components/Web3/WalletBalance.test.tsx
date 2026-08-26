import WalletBalance from '@/components/Web3/WalletBalance'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

const props = {
  balance: '<0.00001',
  usdBalance: '$0.02',
  isLoading: false,
  error: null
}

describe('WalletBalance', () => {
  it('leads with the USD total and lists the token holding', () => {
    render(<WalletBalance {...props} />)

    expect(screen.getByRole('heading', { name: '$0.02 USD' })).toBeVisible()
    expect(screen.getByText('<0.00001 ETH')).toBeVisible()
    expect(screen.getAllByText('$0.02 USD')).toHaveLength(2)
  })

  /**
   * Any zero on screen next to an error reads as "your wallet is empty", which
   * is the misreading this whole panel exists to avoid.
   */
  it('shows no figures at all when the balance could not be read', () => {
    render(
      <WalletBalance
        {...props}
        balance={null}
        usdBalance={null}
        error="Failed to fetch balance from Etherscan"
      />
    )

    expect(
      screen.getByText(/Failed to fetch balance from Etherscan/)
    ).toBeVisible()
    expect(screen.queryByText('0 ETH')).not.toBeInTheDocument()
    expect(screen.queryByText('$0.00 USD')).not.toBeInTheDocument()
    expect(screen.queryByText('Tokens')).not.toBeInTheDocument()
  })

  it('falls back to the ETH amount when only the price is missing', () => {
    render(<WalletBalance {...props} usdBalance={null} />)

    expect(screen.getByRole('heading', { name: '<0.00001 ETH' })).toBeVisible()
    expect(screen.getByText('Price unavailable')).toBeVisible()
    expect(screen.queryByText('$0.00 USD')).not.toBeInTheDocument()
  })

  it('holds the figures back while loading', () => {
    render(
      <WalletBalance {...props} balance={null} usdBalance={null} isLoading />
    )

    expect(screen.getAllByText('...')).toHaveLength(2)
    expect(screen.queryByText('0 ETH')).not.toBeInTheDocument()
    expect(screen.queryByText('Price unavailable')).not.toBeInTheDocument()
  })

  it('renders a zero balance as a real value, not an error', () => {
    render(<WalletBalance {...props} balance="0" usdBalance="$0.00" />)

    expect(screen.getByRole('heading', { name: '$0.00 USD' })).toBeVisible()
    expect(screen.getByText('0 ETH')).toBeVisible()
  })
})
