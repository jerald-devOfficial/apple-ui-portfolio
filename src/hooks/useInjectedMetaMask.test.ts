import { useInjectedMetaMask } from '@/hooks/useInjectedMetaMask'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

type InjectedWindow = Window & { ethereum?: unknown }

const request = vi.fn()
const on = vi.fn()
const removeListener = vi.fn()

const installProvider = () => {
  ;(window as InjectedWindow).ethereum = { request, on, removeListener }
}

/** Replays whatever the hook registered for `accountsChanged`. */
const emitAccountsChanged = (accounts: unknown) => {
  for (const [event, handler] of on.mock.calls) {
    if (event === 'accountsChanged') (handler as (a: unknown) => void)(accounts)
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  request.mockResolvedValue([])
})

afterEach(() => {
  delete (window as InjectedWindow).ethereum
})

describe('useInjectedMetaMask', () => {
  it('explains that the extension is missing when nothing is injected', async () => {
    const { result } = renderHook(() => useInjectedMetaMask())

    expect(result.current.hasProvider).toBe(false)
    expect(result.current.isConnected).toBe(false)
    expect(result.current.error).toBe(
      'MetaMask browser extension not detected or not connected.'
    )
    // Nothing to wait for, so the panel must not sit on a loading state.
    expect(result.current.hasResolved).toBe(true)
  })

  it('does nothing when connect is called without a provider', async () => {
    const { result } = renderHook(() => useInjectedMetaMask())

    await act(async () => {
      await result.current.connect()
    })

    expect(request).not.toHaveBeenCalled()
    expect(result.current.isConnected).toBe(false)
  })

  it('picks up an already authorised account without prompting', async () => {
    installProvider()
    request.mockResolvedValue([ADDRESS])

    const { result } = renderHook(() => useInjectedMetaMask())

    await waitFor(() => expect(result.current.isConnected).toBe(true))

    expect(request).toHaveBeenCalledWith({ method: 'eth_accounts' })
    expect(result.current.address).toBe(ADDRESS)
    expect(result.current.error).toBeNull()
  })

  it('stays disconnected when the extension has authorised nothing', async () => {
    installProvider()

    const { result } = renderHook(() => useInjectedMetaMask())

    await waitFor(() => expect(result.current.hasResolved).toBe(true))

    expect(result.current.isConnected).toBe(false)
    expect(result.current.address).toBeUndefined()
    // The extension is present, so this is a prompt-to-connect state, not an error.
    expect(result.current.error).toBeNull()
  })

  it('prompts for accounts on connect and keeps the first one', async () => {
    installProvider()

    const { result } = renderHook(() => useInjectedMetaMask())

    await waitFor(() => expect(result.current.hasResolved).toBe(true))

    request.mockResolvedValue([
      ADDRESS,
      '0x0000000000000000000000000000000000000001'
    ])

    await act(async () => {
      await result.current.connect()
    })

    expect(request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' })
    expect(result.current.address).toBe(ADDRESS)
    expect(result.current.isConnecting).toBe(false)
  })

  it('stays disconnected when the user rejects the prompt', async () => {
    installProvider()

    const { result } = renderHook(() => useInjectedMetaMask())

    await waitFor(() => expect(result.current.hasResolved).toBe(true))

    request.mockRejectedValue(new Error('User rejected the request'))

    await act(async () => {
      await result.current.connect()
    })

    expect(result.current.isConnected).toBe(false)
    expect(result.current.isConnecting).toBe(false)
  })

  it('follows an account switch in the extension', async () => {
    installProvider()
    request.mockResolvedValue([ADDRESS])

    const { result } = renderHook(() => useInjectedMetaMask())

    await waitFor(() => expect(result.current.isConnected).toBe(true))

    const next = '0x0000000000000000000000000000000000000002'
    act(() => emitAccountsChanged([next]))

    await waitFor(() => expect(result.current.address).toBe(next))
  })

  it('drops the connection when the user locks the wallet', async () => {
    installProvider()
    request.mockResolvedValue([ADDRESS])

    const { result } = renderHook(() => useInjectedMetaMask())

    await waitFor(() => expect(result.current.isConnected).toBe(true))

    act(() => emitAccountsChanged([]))

    await waitFor(() => expect(result.current.isConnected).toBe(false))
  })

  it('unsubscribes on unmount', async () => {
    installProvider()

    const { result, unmount } = renderHook(() => useInjectedMetaMask())

    await waitFor(() => expect(result.current.hasResolved).toBe(true))

    unmount()

    expect(removeListener).toHaveBeenCalledWith(
      'accountsChanged',
      expect.any(Function)
    )
  })

  it('resolves even when the account lookup throws', async () => {
    installProvider()
    request.mockRejectedValue(new Error('provider exploded'))

    const { result } = renderHook(() => useInjectedMetaMask())

    await waitFor(() => expect(result.current.hasResolved).toBe(true))

    expect(result.current.isConnected).toBe(false)
  })
})
