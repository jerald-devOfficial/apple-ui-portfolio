'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (
    event: string,
    handler: (...args: unknown[]) => void
  ) => void
}

const MISSING_EXTENSION =
  'MetaMask browser extension not detected or not connected.'

const getEthereum = () => {
  if (typeof window === 'undefined') return undefined
  return (window as Window & { ethereum?: EthereumProvider }).ethereum
}

const subscribeEthereum = () => () => {}

const firstAccount = (accounts: unknown) => {
  if (!Array.isArray(accounts) || typeof accounts[0] !== 'string') {
    return undefined
  }
  return accounts[0]
}

export const useInjectedMetaMask = () => {
  const hasProvider = useSyncExternalStore(
    subscribeEthereum,
    () => Boolean(getEthereum()),
    () => false
  )
  const [address, setAddress] = useState<string | undefined>()
  const [accountsResolved, setAccountsResolved] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    if (!hasProvider) return

    const ethereum = getEthereum()
    if (!ethereum) return

    let cancelled = false

    const applyAccounts = (accounts: unknown) => {
      if (cancelled) return
      setAddress(firstAccount(accounts))
      setAccountsResolved(true)
    }

    const load = async () => {
      try {
        const existing = await ethereum.request({ method: 'eth_accounts' })
        applyAccounts(existing)
      } catch {
        if (!cancelled) {
          setAddress(undefined)
          setAccountsResolved(true)
        }
      }
    }

    const onAccountsChanged = (...args: unknown[]) => {
      applyAccounts(args[0])
    }

    void load()
    ethereum.on?.('accountsChanged', onAccountsChanged)

    return () => {
      cancelled = true
      ethereum.removeListener?.('accountsChanged', onAccountsChanged)
    }
  }, [hasProvider])

  const connect = useCallback(async () => {
    const ethereum = getEthereum()
    if (!ethereum) return

    setIsConnecting(true)
    try {
      const requested = await ethereum.request({
        method: 'eth_requestAccounts'
      })
      setAddress(firstAccount(requested))
      setAccountsResolved(true)
    } catch {
      setAddress(undefined)
      setAccountsResolved(true)
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const isConnected = Boolean(hasProvider && address)
  const hasResolved = hasProvider ? accountsResolved : true

  return {
    address: isConnected ? address : undefined,
    isConnected,
    hasProvider,
    hasResolved,
    isConnecting,
    connect,
    error: hasProvider ? null : MISSING_EXTENSION
  }
}
