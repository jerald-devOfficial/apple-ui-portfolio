import {
  canAccessPrivateDiary,
  getSessionEmail,
  isDiaryAdmin
} from '@/lib/diary-access'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const ADMIN_EMAIL = 'owner@example.com'

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_ADMIN_EMAIL', ADMIN_EMAIL)
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('getSessionEmail', () => {
  it('lowercases the session email', () => {
    expect(getSessionEmail({ user: { email: 'Reader@Example.com' } })).toBe(
      'reader@example.com'
    )
  })

  it('returns undefined without a session', () => {
    expect(getSessionEmail(null)).toBeUndefined()
    expect(getSessionEmail({ user: {} })).toBeUndefined()
  })
})

describe('isDiaryAdmin', () => {
  it('accepts the admin role regardless of email', () => {
    expect(
      isDiaryAdmin({ user: { email: 'someone@else.com', role: 'admin' } })
    ).toBe(true)
  })

  it('accepts the configured admin email case-insensitively', () => {
    expect(isDiaryAdmin({ user: { email: 'OWNER@example.com' } })).toBe(true)
  })

  it('rejects other users and anonymous visitors', () => {
    expect(isDiaryAdmin({ user: { email: 'reader@example.com' } })).toBe(false)
    expect(isDiaryAdmin(null)).toBe(false)
  })

  it('rejects everyone when no admin email is configured', () => {
    vi.stubEnv('NEXT_PUBLIC_ADMIN_EMAIL', '')

    expect(isDiaryAdmin({ user: { email: 'owner@example.com' } })).toBe(false)
  })
})

describe('canAccessPrivateDiary', () => {
  it('lets the owner read their own diary', () => {
    expect(
      canAccessPrivateDiary('reader@example.com', {
        user: { email: 'Reader@Example.com' }
      })
    ).toBe(true)
  })

  it('lets an admin read anyone’s diary', () => {
    expect(
      canAccessPrivateDiary('reader@example.com', {
        user: { email: ADMIN_EMAIL }
      })
    ).toBe(true)
  })

  it('blocks a different signed-in user', () => {
    expect(
      canAccessPrivateDiary('reader@example.com', {
        user: { email: 'intruder@example.com' }
      })
    ).toBe(false)
  })

  it('blocks anonymous visitors', () => {
    expect(canAccessPrivateDiary('reader@example.com', null)).toBe(false)
  })
})
