import localFont from 'next/font/local'

export const SF_Pro = localFont({
  src: [
    {
      path: '../assets/fonts/SF-Pro-Display-Regular.otf',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../assets/fonts/SF-Pro-Display-Medium.otf',
      weight: '500',
      style: 'normal'
    },
    {
      path: '../assets/fonts/SF-Pro-Display-Semibold.otf',
      weight: '600',
      style: 'normal'
    },
    {
      path: '../assets/fonts/SF-Pro-Display-Bold.otf',
      weight: '700',
      style: 'normal'
    }
  ],
  variable: '--font-sf-pro',
  display: 'swap'
})

export const SF_Mono = localFont({
  src: [
    {
      path: '../assets/fonts/SF-Mono-Regular.otf',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../assets/fonts/SF-Mono-Medium.otf',
      weight: '500',
      style: 'normal'
    },
    {
      path: '../assets/fonts/SF-Mono-Bold.otf',
      weight: '700',
      style: 'normal'
    }
  ],
  variable: '--font-sf-mono',
  display: 'swap'
})
