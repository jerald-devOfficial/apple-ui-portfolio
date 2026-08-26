import { isAdminRole } from '@/lib/admin'
import { describe, expect, it } from 'vitest'

describe('isAdminRole', () => {
  it('accepts the admin role', () => {
    expect(isAdminRole('admin')).toBe(true)
  })

  it('rejects every other role', () => {
    expect(isAdminRole('user')).toBe(false)
    expect(isAdminRole('')).toBe(false)
    expect(isAdminRole(undefined)).toBe(false)
    expect(isAdminRole(null)).toBe(false)
  })
})
