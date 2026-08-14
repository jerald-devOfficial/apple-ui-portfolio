import { isAdminRole } from '@/lib/admin'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const SESSION_PROTECTED_ROUTES = ['/mails', '/admin', '/chess']

const isDiaryWriteRoute = (pathname: string) =>
  pathname === '/diary' || /^\/diary\/[^/]+\/edit\/?$/.test(pathname)

const isSessionProtectedRoute = (pathname: string) =>
  SESSION_PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  ) || isDiaryWriteRoute(pathname)

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET
  })
  const isAuthenticated = Boolean(token)
  const isAdmin = isAdminRole(token?.role as string | undefined)

  if (pathname.startsWith('/contact') && isAdmin) {
    return NextResponse.redirect(new URL('/mails', request.url))
  }

  if (pathname.startsWith('/mails') && isAuthenticated && !isAdmin) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!isAuthenticated && isSessionProtectedRoute(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/mails',
    '/mails/:path*',
    '/admin/:path*',
    '/diary',
    '/diary/:path*',
    '/chess',
    '/chess/:path*',
    '/contact'
  ]
}
