import {
  decideAuthRedirect,
  isDiaryWriteRoute,
  isSessionProtectedRoute
} from '@/lib/route-guard'
import { describe, expect, it } from 'vitest'

describe('isDiaryWriteRoute', () => {
  it('treats create and edit as write routes', () => {
    expect(isDiaryWriteRoute('/diary')).toBe(true)
    expect(isDiaryWriteRoute('/diary/abc/edit')).toBe(true)
    expect(isDiaryWriteRoute('/diary/abc/edit/')).toBe(true)
  })

  it('leaves public diary reading alone', () => {
    expect(isDiaryWriteRoute('/diaries')).toBe(false)
    expect(isDiaryWriteRoute('/diary/abc')).toBe(false)
  })
})

describe('isSessionProtectedRoute', () => {
  it('guards chess, mails, admin, and diary writes', () => {
    expect(isSessionProtectedRoute('/chess')).toBe(true)
    expect(isSessionProtectedRoute('/chess/line/1')).toBe(true)
    expect(isSessionProtectedRoute('/mails')).toBe(true)
    expect(isSessionProtectedRoute('/admin/tools')).toBe(true)
    expect(isSessionProtectedRoute('/diary')).toBe(true)
  })

  it('does not guard public pages', () => {
    expect(isSessionProtectedRoute('/')).toBe(false)
    expect(isSessionProtectedRoute('/portfolio')).toBe(false)
    expect(isSessionProtectedRoute('/contact')).toBe(false)
    expect(isSessionProtectedRoute('/diaries')).toBe(false)
  })
})

describe('decideAuthRedirect', () => {
  const decide = (
    pathname: string,
    session: { isAuthenticated: boolean; isAdmin: boolean }
  ) => decideAuthRedirect({ pathname, ...session })

  const signedOut = { isAuthenticated: false, isAdmin: false }
  const user = { isAuthenticated: true, isAdmin: false }
  const admin = { isAuthenticated: true, isAdmin: true }

  it('sends signed-out visitors home from chess and mails', () => {
    expect(decide('/chess', signedOut)).toEqual({
      type: 'redirect',
      pathname: '/'
    })
    expect(decide('/mails', signedOut)).toEqual({
      type: 'redirect',
      pathname: '/'
    })
  })

  it('lets an authenticated admin through to chess and mails', () => {
    expect(decide('/chess', admin)).toEqual({ type: 'next' })
    expect(decide('/mails', admin)).toEqual({ type: 'next' })
  })

  it('lets a signed-in non-admin through to chess', () => {
    expect(decide('/chess', user)).toEqual({ type: 'next' })
  })

  it('sends a signed-in non-admin away from mails', () => {
    expect(decide('/mails', user)).toEqual({
      type: 'redirect',
      pathname: '/'
    })
  })

  it('sends an admin from contact to the inbox', () => {
    expect(decide('/contact', admin)).toEqual({
      type: 'redirect',
      pathname: '/mails'
    })
  })

  it('leaves contact open for everyone else', () => {
    expect(decide('/contact', signedOut)).toEqual({ type: 'next' })
    expect(decide('/contact', user)).toEqual({ type: 'next' })
  })

  it('does not treat a missing session as an admin', () => {
    expect(decide('/mails', { isAuthenticated: false, isAdmin: true })).toEqual(
      { type: 'redirect', pathname: '/' }
    )
    expect(decide('/chess', { isAuthenticated: false, isAdmin: true })).toEqual(
      { type: 'redirect', pathname: '/' }
    )
  })
})
