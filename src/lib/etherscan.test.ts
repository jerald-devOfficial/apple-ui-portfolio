import {
  buildEtherscanUrl,
  unwrapEtherscanProxyResult,
  unwrapEtherscanResult
} from '@/lib/etherscan'
import { describe, expect, it } from 'vitest'

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
