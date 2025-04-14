import { auth } from '@/auth'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = await auth()

  // If the user is not logged in, redirect to home
  if (!session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Protect these routes with authentication
export const config = {
  matcher: ['/mails/:path*', '/admin/:path*', '/diary/:path*']
}
