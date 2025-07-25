import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import 'react-toastify/dist/ReactToastify.css'
import './globals.css'

import AuthProvider from '@/components/Auth/AuthProvider'
import Wallpapers from '@/components/Wallpapers'
import ResponsiveUI from '@/components/layouts'

import { Providers } from '@/app/providers'
import { getConfig } from '@/wagmi'
import { headers } from 'next/headers'
import { ToastContainer } from 'react-toastify'
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <meta name="theme-color" content="currentColor" />
      </head>
      <body
        className={`${inter.className} flex h-screen flex-col items-center justify-between relative transition-colors`}
      >
        <Providers initialState={initialState}>
          <Wallpapers />
          <AuthProvider>
            <ResponsiveUI>{children}</ResponsiveUI>
          </AuthProvider>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </Providers>
      </body>
    </html>
  )
}
