'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { type ReactNode, useEffect, useState } from 'react'
import { type State, WagmiProvider } from 'wagmi'

import { getConfig } from '@/wagmi'

export function Providers({
  children,
  initialState
}: Readonly<{
  children: ReactNode
  initialState?: State
}>) {
  const [config] = useState(() => getConfig())
  const [queryClient] = useState(() => new QueryClient())

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionProvider>{mounted ? children : null}</SessionProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
