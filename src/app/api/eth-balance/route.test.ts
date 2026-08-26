// @vitest-environment node
import { GET } from '@/app/api/eth-balance/route'
import { ethBalanceResponseSchema } from '@/contracts/etherscan'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { mswServer } from '@/test/msw/nodeServer'
import { HttpResponse, http } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const ETHERSCAN = 'https://api.etherscan.io/v2/api'
const ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

type JsonBody = Parameters<typeof HttpResponse.json>[0]

const respondWith = (body: JsonBody) => {
  const requests: URL[] = []

  mswServer.use(
    http.get(ETHERSCAN, ({ request }) => {
      requests.push(new URL(request.url))
      return HttpResponse.json(body)
    })
  )

  return requests
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('GET /api/eth-balance', () => {
  it('rejects a malformed address without calling Etherscan', async () => {
    const requests = respondWith({ status: '1', result: '0' })
    const res = await GET(buildAppRouteRequest('/api/eth-balance?address=nope'))

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({
      msg: 'A valid Ethereum address is required'
    })
    expect(requests).toHaveLength(0)
  })

  it('rejects a missing address', async () => {
    const res = await GET(buildAppRouteRequest('/api/eth-balance'))

    expect(res.status).toBe(400)
  })

  it('converts wei to ETH without losing a dust balance', async () => {
    respondWith({ status: '1', message: 'OK', result: '6739061868000' })

    const res = await GET(
      buildAppRouteRequest(`/api/eth-balance?address=${ADDRESS}`)
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({
      address: ADDRESS,
      wei: '6739061868000',
      eth: 0.000006739061868
    })
    expect(ethBalanceResponseSchema.safeParse(body).success).toBe(true)
  })

  it('queries the V2 endpoint with the mainnet chain id', async () => {
    const requests = respondWith({ status: '1', result: '0' })

    await GET(buildAppRouteRequest(`/api/eth-balance?address=${ADDRESS}`))

    expect(requests[0].pathname).toBe('/v2/api')
    expect(requests[0].searchParams.get('chainid')).toBe('1')
    expect(requests[0].searchParams.get('address')).toBe(ADDRESS)
  })

  it('reports an Etherscan rejection as a bad gateway', async () => {
    respondWith({
      status: '0',
      message: 'NOTOK',
      result: 'Max rate limit reached'
    })

    const res = await GET(
      buildAppRouteRequest(`/api/eth-balance?address=${ADDRESS}`)
    )

    expect(res.status).toBe(502)
    await expect(res.json()).resolves.toEqual({
      msg: 'Failed to fetch balance from Etherscan'
    })
  })

  it('keeps the upstream reason out of the response body', async () => {
    respondWith({ status: '0', message: 'NOTOK', result: 'Invalid API Key' })

    const res = await GET(
      buildAppRouteRequest(`/api/eth-balance?address=${ADDRESS}`)
    )

    expect(JSON.stringify(await res.json())).not.toContain('Invalid API Key')
  })
})
