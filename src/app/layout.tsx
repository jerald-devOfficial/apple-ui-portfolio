import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Image from 'next/image'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jerald - Apple UI Design Portfolio',
  description: "Discover Jerald's Apple UI inspired portfolio"
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body
        className={`${inter.className} flex min-h-screen flex-col items-center justify-between relative`}
      >
        <div className='absolute block h-full w-full -z-20'>
          <Image
            src={'/images/bg/iOS-light.png'}
            className='object-cover object-center sm:hidden block'
            fill
            priority
            alt='iOS'
          />
          <Image
            src={'/images/bg/ipadOS-light.png'}
            className='object-cover object-center hidden sm:block xl:hidden'
            fill
            priority
            alt='iOS'
          />
          <Image
            src={'/images/bg/macOS-light.jpeg'}
            className='object-cover object-center hidden xl:block'
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
