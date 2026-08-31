export const SESSION_PROTECTED_ROUTES = ['/mails', '/admin', '/chess']

export const isDiaryWriteRoute = (pathname: string) =>
  pathname === '/diary' || /^\/diary\/[^/]+\/edit\/?$/.test(pathname)

export const isSessionProtectedRoute = (pathname: string) =>
  SESSION_PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  ) || isDiaryWriteRoute(pathname)

export type AuthRedirectDecision =
  { type: 'next' } | { type: 'redirect'; pathname: string }

/**
 * Page-level gate used by `src/proxy.ts`. API routes still enforce auth
 * themselves — this only decides whether the document request may proceed.
 *
 * `isAuthenticated` must come from Auth.js `auth()` (the session), not from
 * `getToken()`. The JWT helper is a v4 leftover and does not read the v5
 * production cookie (`__Secure-authjs.session-token` + salt), so a signed-in
 * admin looks logged-out and `/chess` / `/mails` bounce home.
 */
export const decideAuthRedirect = ({
  pathname,
  isAuthenticated,
  isAdmin
}: {
  pathname: string
  isAuthenticated: boolean
  isAdmin: boolean
}): AuthRedirectDecision => {
  if (pathname.startsWith('/contact') && isAdmin) {
    return { type: 'redirect', pathname: '/mails' }
  }

  if (pathname.startsWith('/mails') && isAuthenticated && !isAdmin) {
    return { type: 'redirect', pathname: '/' }
  }

  if (!isAuthenticated && isSessionProtectedRoute(pathname)) {
    return { type: 'redirect', pathname: '/' }
  }

  return { type: 'next' }
}
