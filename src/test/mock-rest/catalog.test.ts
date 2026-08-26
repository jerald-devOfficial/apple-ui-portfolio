import {
  findMockRestEntry,
  MOCK_REST_CATALOG,
  MOCK_REST_FIXTURES,
  MOCK_REST_ROUTES,
  mockRestEntrySchema
} from '@/test/mock-rest/catalog'
import { toMockRestHttpHandlers } from '@/test/mock-rest/mswAdapter'
import { mswServer } from '@/test/msw/nodeServer'
import { TEST_ORIGIN } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it } from 'vitest'

describe('mock-rest catalog', () => {
  it('loads every fixture file', () => {
    expect(Object.keys(MOCK_REST_FIXTURES).length).toBeGreaterThan(0)
    expect(MOCK_REST_CATALOG.length).toBeGreaterThan(
      Object.keys(MOCK_REST_FIXTURES).length - 1
    )
  })

  it('parses every entry against the fixture schema', () => {
    for (const entry of MOCK_REST_CATALOG) {
      expect(mockRestEntrySchema.safeParse(entry).success).toBe(true)
    }
  })

  it('exposes each route once', () => {
    expect(new Set(MOCK_REST_ROUTES).size).toBe(MOCK_REST_ROUTES.length)
  })

  it('has no duplicate route + method + query combinations', () => {
    const keys = MOCK_REST_CATALOG.map(
      (entry) => `${entry.method} ${entry.route}?${entry.query}`
    )

    expect(new Set(keys).size).toBe(keys.length)
  })

  it('keeps the fixture folder mirroring the route it declares', () => {
    for (const [fixturePath, entries] of Object.entries(MOCK_REST_FIXTURES)) {
      const folderRoute = fixturePath
        .replace(/^\.\//, '/')
        .replace(/\/route\.json$/, '')
        .replace(/\[([^\]]+)\]/g, ':$1')

      for (const entry of entries) {
        expect(entry.route).toBe(folderRoute)
      }
    }
  })

  it('finds an entry by route, method and query', () => {
    expect(findMockRestEntry('/api/eth-usd', 'GET')?.status).toBe(200)
    expect(
      findMockRestEntry('/api/eth-usd', 'GET', 'simulate=upstream-error')
        ?.status
    ).toBe(502)
    expect(findMockRestEntry('/api/eth-usd', 'DELETE')).toBeUndefined()
  })
})

describe('toMockRestHttpHandlers', () => {
  beforeEach(() => {
    mswServer.use(...toMockRestHttpHandlers(TEST_ORIGIN))
  })

  it('serves the catch-all entry for a plain request', async () => {
    const response = await fetch(`${TEST_ORIGIN}/api/eth-usd`)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ usd: 3421.55 })
  })

  it('routes on the query string when an entry declares one', async () => {
    const response = await fetch(
      `${TEST_ORIGIN}/api/eth-usd?simulate=upstream-error`
    )

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toMatchObject({
      msg: 'Failed to fetch from CoinGecko'
    })
  })

  it('fills dynamic segments', async () => {
    const response = await fetch(
      `${TEST_ORIGIN}/api/blog/65f000000000000000000101`
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.slug).toBe('shipping-a-testing-harness')
  })

  it('serves a non-JSON body with its declared content type', async () => {
    const response = await fetch(
      `${TEST_ORIGIN}/api/chess/repertoire/export/line-italian?sectionId=section-white-e4`
    )

    expect(response.headers.get('content-type')).toContain(
      'application/x-chess-pgn'
    )
    await expect(response.text()).resolves.toContain('1. e4 e5')
  })

  it('honours the declared status for failure fixtures', async () => {
    const response = await fetch(`${TEST_ORIGIN}/api/photos`, {
      method: 'POST'
    })

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' })
  })
})
