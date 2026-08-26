/**
 * Session fixtures and an `auth()` stub for `@/auth`.
 *
 * ```ts
 * vi.mock('@/auth', async () => (await import('@/test/mocks/auth')).authMock())
 * ```
 */
import { vi } from 'vitest'

export type TestSession = {
  user: {
    email: string
    name?: string
    role?: 'admin' | 'user'
    id?: string
  }
} | null

export const adminSession = (
  email = 'owner@example.com'
): NonNullable<TestSession> => ({
  user: { email, name: 'Owner', role: 'admin', id: 'admin-1' }
})

export const userSession = (
  email = 'reader@example.com'
): NonNullable<TestSession> => ({
  user: { email, name: 'Reader', role: 'user', id: 'user-1' }
})

export const authSpy = vi.fn<() => Promise<TestSession>>()
export const signInSpy = vi.fn()
export const signOutSpy = vi.fn()

export const setSession = (session: TestSession) => {
  authSpy.mockResolvedValue(session)
}

export const authMock = () => ({
  auth: authSpy,
  signIn: signInSpy,
  signOut: signOutSpy,
  handlers: { GET: vi.fn(), POST: vi.fn() }
})
