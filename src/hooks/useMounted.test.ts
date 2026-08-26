import { useMounted } from '@/hooks/useMounted'
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('useMounted', () => {
  it('reports true once rendered on the client', () => {
    const { result } = renderHook(() => useMounted())

    expect(result.current).toBe(true)
  })

  it('stays true across re-renders', () => {
    const { result, rerender } = renderHook(() => useMounted())

    rerender()

    expect(result.current).toBe(true)
  })
})
