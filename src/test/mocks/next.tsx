/**
 * Boundary stubs for the Next.js runtime.
 *
 * Import these from inside a `vi.mock` factory so hoisting stays safe:
 *
 * ```ts
 * vi.mock('next/navigation', async () =>
 *   (await import('@/test/mocks/next')).nextNavigationMock()
 * )
 * ```
 */
import type { AnchorHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { vi } from 'vitest'

export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn()
}

export const redirectMock = vi.fn()
export const notFoundMock = vi.fn()

const navigationState = {
  searchParams: new URLSearchParams(),
  pathname: '/'
}

export const setSearchParams = (init?: string | Record<string, string>) => {
  navigationState.searchParams = new URLSearchParams(init)
}

export const setPathname = (pathname: string) => {
  navigationState.pathname = pathname
}

export const resetNextMocks = () => {
  Object.values(routerMock).forEach((spy) => spy.mockReset())
  redirectMock.mockReset()
  notFoundMock.mockReset()
  navigationState.searchParams = new URLSearchParams()
  navigationState.pathname = '/'
}

export const nextNavigationMock = () => ({
  useRouter: () => routerMock,
  useSearchParams: () => navigationState.searchParams,
  usePathname: () => navigationState.pathname,
  useParams: () => ({}),
  redirect: redirectMock,
  notFound: notFoundMock
})

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string | { pathname?: string }
  children?: ReactNode
}

export const nextLinkMock = () => ({
  default: ({ href, children, ...rest }: LinkProps) => (
    <a href={typeof href === 'string' ? href : (href.pathname ?? '')} {...rest}>
      {children}
    </a>
  )
})

type ImageProps = {
  alt?: string
  src: string
  fill?: boolean
  priority?: boolean
  sizes?: string
  quality?: number
  width?: number
  height?: number
  className?: string
  style?: CSSProperties
}

export const nextImageMock = () => ({
  default: (props: ImageProps) => {
    const { alt = '', src, width, height, className, style } = props

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={alt}
        src={typeof src === 'string' ? src : ''}
        width={width}
        height={height}
        className={className}
        style={style}
      />
    )
  }
})
