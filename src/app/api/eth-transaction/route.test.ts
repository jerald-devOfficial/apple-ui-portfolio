// @vitest-environment node
import { GET } from '@/app/api/eth-transaction/route'
import { ethTransactionResponseSchema } from '@/contracts/etherscan'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { mswServer } from '@/test/msw/nodeServer'
import { HttpResponse, http } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const ETHERSCAN = 'https://api.etherscan.io/v2/api'
const HASH =
  '0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060'

const TRANSACTION = {
  blockHash:
    '0x1d59ff54b1eb26b013ce3cb5fc9dab3705b415a67127a003c3e61eb445bb8df2',
  blockNumber: '0x5daf3b',
  from: '0x5df9b87991262f6ba471f09758cde1c0fc1de734',
  gas: '0x5208',
  gasPrice: '0x4a817c800',
  hash: HASH,
  input: '0x',
  nonce: '0x2',
  to: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
  transactionIndex: '0x41',
  value: '0x2386f26fc10000',
  type: '0x0',
  v: '0x25',
  r: '0x1b5e176d927f8e9ab405058b2d2457392da3e20f328b16ddabcebc33eaac5fea',
  s: '0x4ba69724e8f69de52f0125ad8b3c5c2cef33019bac3249e2c0a2192766d1721c'
}

type JsonBody = Parameters<typeof HttpResponse.json>[0]

const respondWith = (body: JsonBody) =>
  mswServer.use(http.get(ETHERSCAN, () => HttpResponse.json(body)))

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('GET /api/eth-transaction', () => {
  it('rejects a hash that is not 32 bytes', async () => {
    const res = await GET(
      buildAppRouteRequest('/api/eth-transaction?hash=0x12')
    )

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({
      msg: 'A valid 32-byte transaction hash is required'
    })
  })

  it('returns the transaction for a known hash', async () => {
    respondWith({ jsonrpc: '2.0', id: 1, result: TRANSACTION })

    const res = await GET(
      buildAppRouteRequest(`/api/eth-transaction?hash=${HASH}`)
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.transaction.hash).toBe(HASH)
    expect(body.transaction.value).toBe('0x2386f26fc10000')
    expect(ethTransactionResponseSchema.safeParse(body).success).toBe(true)
  })

  it('drops the signature fields the panel never renders', async () => {
    respondWith({ jsonrpc: '2.0', id: 1, result: TRANSACTION })

    const res = await GET(
      buildAppRouteRequest(`/api/eth-transaction?hash=${HASH}`)
    )
    const body = await res.json()

    expect(Object.keys(body.transaction)).not.toContain('r')
    expect(Object.keys(body.transaction)).not.toContain('s')
  })

  it('answers 404 when the node has no record of the hash', async () => {
    respondWith({ jsonrpc: '2.0', id: 1, result: null })

    const res = await GET(
      buildAppRouteRequest(`/api/eth-transaction?hash=${HASH}`)
    )

    expect(res.status).toBe(404)
    await expect(res.json()).resolves.toEqual({ msg: 'Transaction not found' })
  })

  it('does not mistake an Etherscan error string for a transaction', async () => {
    respondWith({
      status: '0',
      message: 'NOTOK',
      result: 'You are using a deprecated V1 endpoint'
    })

    const res = await GET(
      buildAppRouteRequest(`/api/eth-transaction?hash=${HASH}`)
    )

    expect(res.status).toBe(502)
    await expect(res.json()).resolves.toEqual({
      msg: 'Failed to fetch the transaction from Etherscan'
    })
  })

  it('accepts a pending transaction that has no block yet', async () => {
    respondWith({
      jsonrpc: '2.0',
      id: 1,
      result: {
        ...TRANSACTION,
        blockHash: null,
        blockNumber: null,
        transactionIndex: null
      }
    })

    const res = await GET(
      buildAppRouteRequest(`/api/eth-transaction?hash=${HASH}`)
    )

    expect(res.status).toBe(200)
  })
})
