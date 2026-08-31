// @vitest-environment node
import { adminSession, userSession, type TestSession } from '@/test/mocks/auth'
import type { NextFetchEvent } from 'next/server'
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sessionState = vi.hoisted(() => ({
  current: null as TestSession
}))

vi.mock('@/auth', () => ({
  auth:
    (handler: (request: NextRequest & { auth: TestSession }) => unknown) =>
    (request: NextRequest) => {
      const authed = Object.assign(request, { auth: sessionState.current })
      return handler(authed)
    }
}))

const { proxy } = await import('@/proxy')

type ProxyFn = (
  request: NextRequest,
  event: NextFetchEvent
) => Response | void | Promise<Response | void>

const handleProxy = proxy as unknown as ProxyFn

const requestFor = (pathname: string) =>
  new NextRequest(new URL(pathname, 'https://jeraldbaroro.xyz'))

const dummyEvent = {} as NextFetchEvent

const runProxy = async (pathname: string) => {
  const response = await handleProxy(requestFor(pathname), dummyEvent)

  if (!response) {
    throw new Error(`proxy returned void for ${pathname}`)
  }

  return response
}

const locationOf = (response: Response) =>
  new URL(response.headers.get('location') ?? '', 'https://jeraldbaroro.xyz')
    .pathname

describe('proxy auth gate', () => {
  beforeEach(() => {
    sessionState.current = null
  })

  afterEach(() => {
    sessionState.current = null
  })

  it('redirects signed-out visitors away from chess and mails', async () => {
    const chess = await runProxy('/chess')
    const mails = await runProxy('/mails')

    expect(chess.status).toBe(307)
    expect(locationOf(chess)).toBe('/')
    expect(mails.status).toBe(307)
    expect(locationOf(mails)).toBe('/')
  })

  it('lets an authenticated admin through to chess and mails', async () => {
    sessionState.current = adminSession()

    const chess = await runProxy('/chess')
    const mails = await runProxy('/mails')

    expect(chess.status).not.toBe(307)
    expect(mails.status).not.toBe(307)
    expect(chess.headers.get('location')).toBeNull()
    expect(mails.headers.get('location')).toBeNull()
  })

  it('lets a signed-in non-admin through to chess but not mails', async () => {
    sessionState.current = userSession()

    const chess = await runProxy('/chess')
    const mails = await runProxy('/mails')

    expect(chess.status).not.toBe(307)
    expect(mails.status).toBe(307)
    expect(locationOf(mails)).toBe('/')
  })
})
