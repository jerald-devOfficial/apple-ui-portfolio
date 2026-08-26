// @vitest-environment node
import { diaryLikeResponseSchema } from '@/contracts/diary'
import { buildAppRouteRequest, routeContext } from '@/test/handlerRequest'
import { setSession, userSession } from '@/test/mocks/auth'
import type { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const dbConnect = vi.hoisted(() => vi.fn())
const diaryFindById = vi.hoisted(() => vi.fn())
const userFindOne = vi.hoisted(() => vi.fn())
const userUpdateOne = vi.hoisted(() => vi.fn())

vi.mock('@/utils/db', () => ({ default: dbConnect }))
vi.mock('@/auth', async () => (await import('@/test/mocks/auth')).authMock())
vi.mock('@/models/Diary', () => ({
  default: { findById: diaryFindById },
  Diary: { findById: diaryFindById }
}))
vi.mock('@/models/User', () => ({
  User: { findOne: userFindOne, updateOne: userUpdateOne }
}))

const { POST } = await import('@/app/api/diary/[id]/like/route')

const DIARY_ID = '65f000000000000000000201'
const USER_ID = '65f000000000000000000301'

const like = (id = DIARY_ID) =>
  POST(
    buildAppRouteRequest(`/api/diary/${id}/like`, {
      method: 'POST'
    }) as NextRequest,
    routeContext({ id })
  )

beforeEach(() => {
  vi.clearAllMocks()
  dbConnect.mockResolvedValue(undefined)
  setSession(userSession())
  diaryFindById.mockResolvedValue({ _id: DIARY_ID })
  userFindOne.mockResolvedValue({ _id: USER_ID, likedDiaries: [] })
  userUpdateOne.mockResolvedValue({ acknowledged: true })
})

describe('POST /api/diary/[id]/like', () => {
  it('rejects an anonymous visitor', async () => {
    setSession(null)

    const response = await like()

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      error: 'Please sign in to like diaries'
    })
    expect(dbConnect).not.toHaveBeenCalled()
  })

  it('rejects an id that is not an ObjectId', async () => {
    const response = await like('not-an-id')

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid diary ID'
    })
  })

  it('answers 404 for a diary that does not exist', async () => {
    diaryFindById.mockResolvedValue(null)

    const response = await like()

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: 'Diary not found' })
  })

  it('answers 404 when the session has no matching user record', async () => {
    userFindOne.mockResolvedValue(null)

    const response = await like()

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: 'User not found' })
  })

  it('adds the like for a diary the user has not liked yet', async () => {
    const response = await like()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(diaryLikeResponseSchema.safeParse(body).success).toBe(true)
    expect(body).toEqual({ liked: true })
    expect(userUpdateOne).toHaveBeenCalledWith(
      { _id: USER_ID },
      { $addToSet: { likedDiaries: DIARY_ID } }
    )
  })

  it('removes the like when the user has already liked the diary', async () => {
    userFindOne.mockResolvedValue({ _id: USER_ID, likedDiaries: [DIARY_ID] })

    const response = await like()

    await expect(response.json()).resolves.toEqual({ liked: false })
    expect(userUpdateOne).toHaveBeenCalledWith(
      { _id: USER_ID },
      { $pull: { likedDiaries: { $in: [DIARY_ID, DIARY_ID] } } }
    )
  })

  // Legacy documents stored the id as a string, newer ones as an ObjectId, so
  // the comparison has to be stringified on both sides.
  it('recognises a like stored as an ObjectId-like value', async () => {
    userFindOne.mockResolvedValue({
      _id: USER_ID,
      likedDiaries: [{ toString: () => DIARY_ID }]
    })

    const response = await like()

    await expect(response.json()).resolves.toEqual({ liked: false })
  })

  it('treats a user without a likedDiaries array as having no likes', async () => {
    userFindOne.mockResolvedValue({ _id: USER_ID })

    const response = await like()

    await expect(response.json()).resolves.toEqual({ liked: true })
  })

  it('answers with a 500 envelope when the update throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    userUpdateOne.mockRejectedValue(new Error('mongo down'))

    const response = await like()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to like diary'
    })
  })
})
