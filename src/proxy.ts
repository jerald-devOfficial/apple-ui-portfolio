import { auth } from '@/auth'
import { isAdminRole } from '@/lib/admin'
import { decideAuthRedirect } from '@/lib/route-guard'
import { NextResponse } from 'next/server'

/**
 * Use Auth.js `auth()`, not `getToken()` from `next-auth/jwt`.
 * `getToken` is a v4 helper and does not decode v5 production cookies, so a
 * signed-in admin is treated as logged-out and `/chess` / `/mails` redirect
 * home. `auth()` is the same reader the rest of the app already uses.
 */
export const proxy = auth((request) => {
  const { pathname } = request.nextUrl
  const isAuthenticated = Boolean(request.auth?.user)
  const isAdmin = isAdminRole(request.auth?.user?.role)

  const decision = decideAuthRedirect({
    pathname,
    isAuthenticated,
    isAdmin
  })

  if (decision.type === 'redirect') {
    return NextResponse.redirect(new URL(decision.pathname, request.url))
  }

  return NextResponse.next()
})

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
