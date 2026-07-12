import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const SESSION_COOKIES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  '__Host-authjs.session-token'
]

const hasSession = (request: NextRequest) =>
  SESSION_COOKIES.some((name) => request.cookies.has(name))

export const middleware = (request: NextRequest) => {
  if (!hasSession(request)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/mails/:path*', '/admin/:path*', '/diary/:path*', '/chess/:path*']
}
