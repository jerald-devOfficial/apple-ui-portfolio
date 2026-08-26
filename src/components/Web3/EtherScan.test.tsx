import EtherScan from '@/components/Web3/EtherScan'
import { TEST_ORIGIN } from '@/test/handlerRequest'
import { toMockRestHttpHandlers } from '@/test/mock-rest/mswAdapter'
import { mswServer } from '@/test/msw/nodeServer'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

const HASH =
  '0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060'

const search = async (hash: string) => {
  await userEvent.type(
    screen.getByPlaceholderText('Enter Transaction Hash'),
    hash
  )
  await userEvent.click(screen.getByRole('button'))
}

beforeEach(() => {
  mswServer.use(...toMockRestHttpHandlers(TEST_ORIGIN))
})

describe('EtherScan', () => {
  it('shows the lookup instructions before anything is submitted', () => {
    render(<EtherScan />)

    expect(screen.getByText('To test this feature')).toBeVisible()
  })

  /**
   * The panel used to label `blockHash` as the transaction hash, so the row
   * never matched the hash the visitor had just pasted in.
   */
  it('renders the transaction hash rather than the block hash', async () => {
    render(<EtherScan />)

    await search(HASH)

    expect(await screen.findByText('Transaction Details')).toBeVisible()
    expect(screen.getByText('0x5c504ed4...fba1b22060')).toBeVisible()
    expect(screen.queryByText(/0x1d59ff54/)).not.toBeInTheDocument()
  })

  it('formats the transferred value in ETH', async () => {
    render(<EtherScan />)

    await search(HASH)

    // The fixture carries 0x2386f26fc10000 wei.
    expect(await screen.findByText('0.01 ETH')).toBeVisible()
  })

  it('reports a hash the node does not know', async () => {
    mswServer.use(
      http.get(`${TEST_ORIGIN}/api/eth-transaction`, () =>
        HttpResponse.json({ msg: 'Transaction not found' }, { status: 404 })
      )
    )

    render(<EtherScan />)

    await search(HASH)

    expect(await screen.findByText('Transaction not found')).toBeVisible()
    expect(screen.queryByText('Transaction Details')).not.toBeInTheDocument()
  })

  it('clears the result so another hash can be searched', async () => {
    render(<EtherScan />)

    await search(HASH)

    await userEvent.click(await screen.findByRole('button', { name: 'Clear' }))

    expect(screen.queryByText('Transaction Details')).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter Transaction Hash')).toHaveValue(
      ''
    )
  })
})
