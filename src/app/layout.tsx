import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Image from 'next/image'

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

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <meta name='theme-color' content='currentColor' />
      <body
        className={`${inter.className} flex min-h-screen flex-col items-center justify-between relative`}
      >
        <div className='absolute block h-full w-full -z-20'>
          <Image
            src={'/images/bg/iOS-light.png'}
            className='object-cover object-center sm:hidden block'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw'
            fill
            priority
            alt='iOS'
          />
          <Image
            src={'/images/bg/ipadOS-light.png'}
            className='object-cover object-center hidden sm:block lg:hidden'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw'
            fill
            priority
            alt='iOS'
          />
          <Image
            src={'/images/bg/macOS-light.jpeg'}
            className='object-cover object-center hidden lg:block'
            fill
            priority
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw'
            alt='iOS'
          />
        </div>
        {children}
      </body>
    </html>
  )
}
