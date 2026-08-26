import { blogListResponseSchema } from '@/contracts/blog'
import { diaryListResponseSchema } from '@/contracts/diary'
import { fetcher } from '@/lib/fetcher'
import { TEST_ORIGIN } from '@/test/handlerRequest'
import { toMockRestHttpHandlers } from '@/test/mock-rest/mswAdapter'
import { mswServer } from '@/test/msw/nodeServer'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import useSWR, { SWRConfig } from 'swr'
import { beforeEach, describe, expect, it } from 'vitest'

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
  mswServer.use(...toMockRestHttpHandlers(TEST_ORIGIN))
})

describe('fetcher against the mock REST catalog', () => {
  it('returns the parsed body for a 200', async () => {
    const body = await fetcher('/api/eth-usd')

    expect(body).toEqual({ usd: 3421.55 })
  })

  it('throws on a non-OK response', async () => {
    await expect(
      fetcher('/api/eth-usd?simulate=upstream-error')
    ).rejects.toThrow('An error occurred while fetching the data.')
  })
})

describe('diary list over SWR', () => {
  it('resolves a contract-valid payload', async () => {
    const { result } = renderHook(() => useSWR('/api/diary', fetcher), {
      wrapper
    })

    await waitFor(() => expect(result.current.data).toBeDefined())

    const parsed = diaryListResponseSchema.safeParse(result.current.data)

    expect(parsed.success).toBe(true)
    expect(parsed.data?.diaries).toHaveLength(1)
    expect(parsed.data?.diaries[0]?.publicity).toBe(true)
  })

  it('surfaces a database failure as an SWR error', async () => {
    const { result } = renderHook(
      () => useSWR('/api/diary?simulate=error', fetcher),
      { wrapper }
    )

    await waitFor(() => expect(result.current.error).toBeDefined())
    expect(result.current.data).toBeUndefined()
  })
})

describe('blog list over SWR', () => {
  it('resolves a contract-valid payload', async () => {
    const { result } = renderHook(() => useSWR('/api/blog', fetcher), {
      wrapper
    })

    await waitFor(() => expect(result.current.data).toBeDefined())

    const parsed = blogListResponseSchema.safeParse(result.current.data)

    expect(parsed.success).toBe(true)
    expect(parsed.data?.pagination.page).toBe(1)
  })

  it('routes the featured filter to its own fixture', async () => {
    const { result } = renderHook(
      () => useSWR('/api/blog?featured=true', fetcher),
      { wrapper }
    )

    await waitFor(() => expect(result.current.data).toBeDefined())

    const parsed = blogListResponseSchema.safeParse(result.current.data)

    expect(parsed.success).toBe(true)
    expect(parsed.data?.blogs.every((blog) => blog.featured)).toBe(true)
  })

  it('lets a test override the catalog for a one-off case', async () => {
    mswServer.use(
      http.get(`${TEST_ORIGIN}/api/blog`, () =>
        HttpResponse.json({
          blogs: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 }
        })
      )
    )

    const { result } = renderHook(() => useSWR('/api/blog', fetcher), {
      wrapper
    })

    await waitFor(() => expect(result.current.data).toBeDefined())
    expect(result.current.data.blogs).toEqual([])
  })
})
