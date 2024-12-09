import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import AuthProvider from '@/components/Auth/AuthProvider'
import Wallpapers from '@/components/Wallpapers'
import ResponsiveUI from '@/components/layouts'

import { Providers } from '@/app/providers'
import { getConfig } from '@/wagmi'
import { headers } from 'next/headers'
import { cookieToInitialState } from 'wagmi'

const inter = Inter({ subsets: ['latin'] })

const title = 'Jerald - Apple UI Design Portfolio'
const description = "Discover Jerald's Apple UI inspired portfolio"
const alt =
  "JB - Jerald Baroro's Next.js portfolio based on Apple's UI design system"

export const metadata: Metadata = {
  title: title,
  description: description,
  twitter: {
    images: {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/images/logo/logo.png`,
      alt: alt,
      type: 'image/png',
      width: 300,
      height: 300
    }
  },
  openGraph: {
    title: title,
    images: {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/images/logo/logo.png`,
      alt: alt,
      type: 'image/png',
      width: 300,
      height: 300
    },
    siteName: title,
    description: description
  }
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const initialState = cookieToInitialState(
    getConfig(),
    headersList.get('cookie')
  )
  return (
    <html lang='en'>
      <meta name='theme-color' content='currentColor' />
      <body
        className={`${inter.className} flex h-screen flex-col items-center justify-between relative`}
      >
        <Wallpapers />
        <AuthProvider>
          <Providers initialState={initialState}>
            <ResponsiveUI>{children}</ResponsiveUI>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}
