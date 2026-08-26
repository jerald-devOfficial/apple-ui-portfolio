// @vitest-environment node
import { diaryListResponseSchema } from '@/contracts/diary'
import { adminSession, setSession, userSession } from '@/test/mocks/auth'
import { queryChain } from '@/test/mocks/mongoose'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const dbConnect = vi.hoisted(() => vi.fn())
const diaryFind = vi.hoisted(() => vi.fn())

vi.mock('@/utils/db', () => ({ default: dbConnect }))
vi.mock('@/auth', async () => (await import('@/test/mocks/auth')).authMock())
vi.mock('@/models/Diary', () => ({
  default: { find: diaryFind },
  Diary: { find: diaryFind }
}))

const { GET } = await import('@/app/api/diary/route')

const diary = {
  _id: '65f000000000000000000201',
  userId: 'owner@example.com',
  title: 'Refactoring the data layer',
  content: 'Notes from the migration.',
  publicity: true,
  tags: ['engineering'],
  status: 'published',
  isFavorite: false,
  createdAt: '2024-04-02T09:00:00.000Z',
  updatedAt: '2024-04-02T09:00:00.000Z'
}

beforeEach(() => {
  vi.clearAllMocks()
  dbConnect.mockResolvedValue(undefined)
  setSession(null)
  diaryFind.mockReturnValue(queryChain([diary]))
})

describe('GET /api/diary', () => {
  it('returns a contract-valid list', async () => {
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(diaryListResponseSchema.safeParse(body).success).toBe(true)
    expect(body.pagination.totalItems).toBe(1)
  })

  it('shows anonymous visitors only public diaries', async () => {
    await GET()

    expect(diaryFind).toHaveBeenCalledWith({ publicity: true })
  })

  it('shows a signed-in user public diaries plus their own', async () => {
    setSession(userSession())

    await GET()

    expect(diaryFind).toHaveBeenCalledWith({
      $or: [{ publicity: true }, { userId: 'reader@example.com' }]
    })
  })

  it('shows the admin every diary', async () => {
    setSession(adminSession())

    await GET()

    expect(diaryFind).toHaveBeenCalledWith({})
  })

  it('matches the admin by NEXT_PUBLIC_ADMIN_EMAIL as well', async () => {
    vi.stubEnv('NEXT_PUBLIC_ADMIN_EMAIL', 'Owner@Example.com')
    setSession(userSession('owner@example.com'))

    await GET()

    expect(diaryFind).toHaveBeenCalledWith({})
    vi.unstubAllEnvs()
  })

  it('sorts newest first', async () => {
    const chain = queryChain([diary])
    diaryFind.mockReturnValue(chain)

    await GET()

    expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 })
  })

  it('answers with a 500 envelope when the query throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    diaryFind.mockImplementation(() => {
      throw new Error('mongo down')
    })

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ msg: 'Database Error' })
  })
})
