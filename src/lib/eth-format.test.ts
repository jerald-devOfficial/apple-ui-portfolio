import { formatEthBalance, formatUsdBalance } from '@/lib/eth-format'
import { describe, expect, it } from 'vitest'

describe('formatEthBalance', () => {
  it('marks a dust balance as below the display threshold', () => {
    expect(formatEthBalance(0.0000059)).toBe('<0.00001')
  })

  it('renders an exactly zero balance as a plain zero', () => {
    expect(formatEthBalance(0)).toBe('0')
  })

  it('trims trailing zeros', () => {
    expect(formatEthBalance(0.02)).toBe('0.02')
    expect(formatEthBalance(2)).toBe('2')
  })

  it('caps the fraction at five decimals', () => {
    expect(formatEthBalance(6.641702244136839)).toBe('6.6417')
    expect(formatEthBalance(1.23456789)).toBe('1.23457')
  })

  it('falls back to zero for a non-finite value', () => {
    expect(formatEthBalance(Number.NaN)).toBe('0')
  })
})

describe('formatUsdBalance', () => {
  it('formats a cent-level amount', () => {
    expect(formatUsdBalance(0.0203)).toBe('$0.02')
  })

  it('marks a sub-cent amount as below the display threshold', () => {
    expect(formatUsdBalance(0.004)).toBe('<$0.01')
  })

  it('groups thousands', () => {
    expect(formatUsdBalance(12345.678)).toBe('$12,345.68')
  })

  it('falls back to zero for a non-finite value', () => {
    expect(formatUsdBalance(Number.NaN)).toBe('$0.00')
    expect(formatUsdBalance(0)).toBe('$0.00')
  })
})
