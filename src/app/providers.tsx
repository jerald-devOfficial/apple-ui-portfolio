'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { type ReactNode } from 'react'

export const Providers = ({
  children
}: Readonly<{
  children: ReactNode
}>) => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <SessionProvider>{children}</SessionProvider>
  </ThemeProvider>
)
