// @vitest-environment node
import { GET } from '@/app/api/eth-usd/route'
import { ethUsdErrorResponseSchema, ethUsdResponseSchema } from '@/contracts'
import { mswServer } from '@/test/msw/nodeServer'
import { HttpResponse, http } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const COINGECKO = 'https://api.coingecko.com/api/v3/simple/price'

type JsonBody = Parameters<typeof HttpResponse.json>[0]

const respondWith = (body: JsonBody, init?: { status: number }) =>
  mswServer.use(http.get(COINGECKO, () => HttpResponse.json(body, init)))

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('GET /api/eth-usd', () => {
  it('returns the contract-valid price', async () => {
    respondWith({ ethereum: { usd: 3421.55 } })

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(ethUsdResponseSchema.safeParse(body).success).toBe(true)
    expect(body.usd).toBe(3421.55)
  })

  it('reports a non-OK upstream as a bad gateway', async () => {
    respondWith({ status: { error_code: 429 } }, { status: 429 })

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(502)
    expect(ethUsdErrorResponseSchema.safeParse(body).success).toBe(true)
    expect(body).toMatchObject({
      msg: 'Failed to fetch from CoinGecko',
      status: 429
    })
  })

  it('rejects a 200 response that has no price in it', async () => {
    respondWith({ ethereum: {} })

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(502)
    expect(body.msg).toBe('Invalid data from CoinGecko')
  })

  it('answers 500 when the upstream call throws', async () => {
    mswServer.use(http.get(COINGECKO, () => HttpResponse.error()))

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(ethUsdErrorResponseSchema.safeParse(body).success).toBe(true)
    expect(body.msg).toBe('Error fetching ETH-USD price')
  })
})
