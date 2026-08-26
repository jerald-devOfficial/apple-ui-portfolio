import { repertoireResponseSchema } from '@/contracts/chess'
import { useRepertoire } from '@/app/chess/_hooks/useRepertoire'
import { TEST_ORIGIN } from '@/test/handlerRequest'
import { toMockRestHttpHandlers } from '@/test/mock-rest/mswAdapter'
import { mswServer } from '@/test/msw/nodeServer'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const useSession = vi.hoisted(() => vi.fn())

vi.mock('next-auth/react', () => ({ useSession }))

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig
    value={{
      provider: () => new Map(),
      dedupingInterval: 0,
      revalidateOnFocus: false
    }}
  >
    {children}
  </SWRConfig>
)

beforeEach(() => {
  vi.clearAllMocks()
  useSession.mockReturnValue({ status: 'authenticated' })
  mswServer.use(...toMockRestHttpHandlers(TEST_ORIGIN))
})

describe('useRepertoire', () => {
  it('loads a contract-valid repertoire for an authenticated player', async () => {
    const { result } = renderHook(() => useRepertoire(), { wrapper })

    await waitFor(() => expect(result.current.repertoire).toBeDefined())

    expect(
      repertoireResponseSchema.safeParse({
        repertoire: result.current.repertoire,
        success: true
      }).success
    ).toBe(true)
    expect(result.current.repertoire?.sections[0]?.title).toBe('1. e4 Openings')
  })

  it('does not fetch while the session is still loading', async () => {
    useSession.mockReturnValue({ status: 'loading' })

    const { result } = renderHook(() => useRepertoire(), { wrapper })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.repertoire).toBeUndefined()
  })

  it('does not fetch for an unauthenticated visitor', async () => {
    useSession.mockReturnValue({ status: 'unauthenticated' })

    const { result } = renderHook(() => useRepertoire(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.repertoire).toBeUndefined()
  })

  it('writes the PATCH response straight into the SWR cache', async () => {
    const updated = {
      repertoire: {
        _id: '65f000000000000000000701',
        userId: 'owner@example.com',
        sections: [],
        createdAt: '2024-05-01T09:00:00.000Z',
        updatedAt: '2024-05-07T09:00:00.000Z'
      },
      success: true
    }

    mswServer.use(
      http.patch(`${TEST_ORIGIN}/api/chess/repertoire`, () =>
        HttpResponse.json(updated)
      )
    )

    const { result } = renderHook(() => useRepertoire(), { wrapper })

    await waitFor(() => expect(result.current.repertoire).toBeDefined())

    const returned = await result.current.updateRepertoire({
      action: 'deleteSection',
      sectionId: 'section-white-e4'
    })

    expect(returned.sections).toEqual([])
    await waitFor(() => expect(result.current.repertoire?.sections).toEqual([]))
  })

  it('rejects a failed PATCH', async () => {
    const { result } = renderHook(() => useRepertoire(), { wrapper })

    await waitFor(() => expect(result.current.repertoire).toBeDefined())

    await expect(result.current.updateRepertoire({})).rejects.toThrow(
      'Failed to update repertoire'
    )
  })

  it('surfaces the server message when a PGN import fails', async () => {
    const { result } = renderHook(() => useRepertoire(), { wrapper })

    await waitFor(() => expect(result.current.repertoire).toBeDefined())

    await expect(
      result.current.importPgn('section-white-e4', 'line-italian', 'not a pgn')
    ).rejects.toThrow('Could not parse PGN')
  })
})
