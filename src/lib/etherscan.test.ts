import {
  buildEtherscanUrl,
  fetchEtherscanJson,
  unwrapEtherscanProxyResult,
  unwrapEtherscanResult
} from '@/lib/etherscan'
import { mswServer } from '@/test/msw/nodeServer'
import { HttpResponse, http } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

const ETHERSCAN = 'https://api.etherscan.io/v2/api'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('buildEtherscanUrl', () => {
  it('targets the V2 endpoint with the mainnet chain id', () => {
    const url = new URL(
      buildEtherscanUrl({ module: 'account', action: 'balance' })
    )

    expect(url.origin + url.pathname).toBe('https://api.etherscan.io/v2/api')
    expect(url.searchParams.get('chainid')).toBe('1')
  })

  it('passes the caller params through', () => {
    const url = new URL(
      buildEtherscanUrl({
        module: 'account',
        action: 'balance',
        address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        tag: 'latest'
      })
    )

    expect(url.searchParams.get('module')).toBe('account')
    expect(url.searchParams.get('action')).toBe('balance')
    expect(url.searchParams.get('address')).toBe(
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
    )
    expect(url.searchParams.get('tag')).toBe('latest')
  })
})

describe('unwrapEtherscanResult', () => {
  it('returns the result of a successful response', () => {
    expect(
      unwrapEtherscanResult({
        status: '1',
        message: 'OK',
        result: '6641702244136839062'
      })
    ).toBe('6641702244136839062')
  })

  it('throws with the Etherscan explanation on a failed response', () => {
    expect(() =>
      unwrapEtherscanResult({
        status: '0',
        message: 'NOTOK',
        result: 'Max rate limit reached'
      })
    ).toThrow('Max rate limit reached')
  })

  it('falls back to the message when the result is not a string', () => {
    expect(() =>
      unwrapEtherscanResult({ status: '0', message: 'NOTOK', result: null })
    ).toThrow('NOTOK')
  })
})

describe('unwrapEtherscanProxyResult', () => {
  it('returns the JSON-RPC result object', () => {
    expect(unwrapEtherscanProxyResult({ result: { hash: '0xabc' } })).toEqual({
      hash: '0xabc'
    })
  })

  it('returns null for a hash the node does not know', () => {
    expect(unwrapEtherscanProxyResult({ result: null })).toBeNull()
  })

  it('throws rather than returning an error string as a transaction', () => {
    expect(() =>
      unwrapEtherscanProxyResult({
        status: '0',
        message: 'NOTOK',
        result: 'You are using a deprecated V1 endpoint'
      })
    ).toThrow('deprecated V1 endpoint')
  })

  it('throws on a JSON-RPC error', () => {
    expect(() =>
      unwrapEtherscanProxyResult({ error: { message: 'invalid argument 0' } })
    ).toThrow('invalid argument 0')
  })
})

describe('Etherscan API key', () => {
  it('sends the server key and ignores the leftover public name', () => {
    vi.stubEnv('ETHERSCAN_API_KEY', 'server-key')
    vi.stubEnv('NEXT_PUBLIC_ETHERSCAN_API_KEY', 'public-key')

    const url = new URL(
      buildEtherscanUrl({ module: 'account', action: 'balance' })
    )

    expect(url.searchParams.get('apikey')).toBe('server-key')
  })

  it('still attaches a key after the public env name was the only one set', () => {
    vi.stubEnv('ETHERSCAN_API_KEY', '')
    vi.stubEnv('NEXT_PUBLIC_ETHERSCAN_API_KEY', 'public-key')

    const url = new URL(
      buildEtherscanUrl({ module: 'account', action: 'balance' })
    )

    expect(url.searchParams.get('apikey')).toBe('public-key')
  })
})

describe('fetchEtherscanJson', () => {
  it('throws on a non-OK HTTP status instead of parsing HTML as JSON', async () => {
    mswServer.use(
      http.get(ETHERSCAN, () => new HttpResponse('forbidden', { status: 403 }))
    )

    await expect(
      fetchEtherscanJson({ module: 'account', action: 'balance' })
    ).rejects.toThrow('Etherscan HTTP 403')
  })
})
