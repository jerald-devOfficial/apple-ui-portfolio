// @vitest-environment node
import { photoListResponseSchema, photoSchema } from '@/contracts/photos'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { adminSession, setSession, userSession } from '@/test/mocks/auth'
import { modelConstructor, queryChain } from '@/test/mocks/mongoose'
import type { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const dbConnect = vi.hoisted(() => vi.fn())
const photoFind = vi.hoisted(() => vi.fn())
const uploadFileToR2 = vi.hoisted(() => vi.fn())
const resolveCapturedAt = vi.hoisted(() => vi.fn())

vi.mock('@/utils/db', () => ({ default: dbConnect }))
vi.mock('@/auth', async () => (await import('@/test/mocks/auth')).authMock())
vi.mock('@/lib/r2', () => ({ uploadFileToR2 }))
vi.mock('@/lib/photo-metadata.server', () => ({ resolveCapturedAt }))

const PhotoCtor = modelConstructor({
  _id: '65f000000000000000000401',
  createdAt: '2024-07-04T12:00:00.000Z',
  updatedAt: '2024-07-04T12:00:00.000Z'
})

vi.mock('@/models/Photo', () => {
  Object.assign(PhotoCtor, { find: photoFind })
  return { Photo: PhotoCtor, default: PhotoCtor }
})

const { GET, POST } = await import('@/app/api/photos/route')

const publicPhoto = {
  _id: '65f000000000000000000401',
  title: 'Sunset over Taal',
  imageUrl: 'https://cdn.example.com/photos/taal.jpg',
  imageKey: 'photos/taal.jpg',
  uploadedBy: 'owner@example.com',
  isPublic: true,
  capturedAt: '2024-03-11T09:12:00.000Z',
  createdAt: '2024-03-12T02:00:00.000Z',
  updatedAt: '2024-03-12T02:00:00.000Z'
}

const olderPhoto = {
  ...publicPhoto,
  _id: '65f000000000000000000402',
  title: 'Harbour lights',
  capturedAt: '2023-01-05T18:40:00.000Z'
}

const asNextRequest = (request: Request) => request as unknown as NextRequest

const buildUpload = (
  file: File,
  fields: Record<string, string> = {}
): NextRequest => {
  const formData = new FormData()
  formData.append('file', file)
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value)
  }

  return asNextRequest(
    buildAppRouteRequest('/api/photos', { method: 'POST', body: formData })
  )
}

const jpeg = () =>
  new File([new Uint8Array([0xff, 0xd8, 0xff])], 'IMG_20240311_091200.jpg', {
    type: 'image/jpeg'
  })

beforeEach(() => {
  vi.clearAllMocks()
  dbConnect.mockResolvedValue(undefined)
  setSession(null)
  photoFind.mockReturnValue(queryChain([publicPhoto]))
  uploadFileToR2.mockResolvedValue(
    'https://cdn.example.com/photos/uploaded.jpg'
  )
  resolveCapturedAt.mockResolvedValue(null)
  PhotoCtor.save.mockResolvedValue(undefined)
})

describe('GET /api/photos', () => {
  it('returns a contract-valid list', async () => {
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(photoListResponseSchema.safeParse(body).success).toBe(true)
  })

  it('hides private photos from non-admins', async () => {
    await GET()

    expect(photoFind).toHaveBeenCalledWith({ isPublic: true })
  })

  it('returns every photo to an admin', async () => {
    setSession(adminSession())

    await GET()

    expect(photoFind).toHaveBeenCalledWith()
  })

  it('sorts by display date, newest first', async () => {
    photoFind.mockReturnValue(queryChain([olderPhoto, publicPhoto]))

    const response = await GET()
    const body = await response.json()

    expect(body.map((photo: { title: string }) => photo.title)).toEqual([
      'Sunset over Taal',
      'Harbour lights'
    ])
  })

  it('answers with a 500 envelope when the query throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    photoFind.mockImplementation(() => {
      throw new Error('mongo down')
    })

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to fetch photos'
    })
  })
})

describe('POST /api/photos', () => {
  it('rejects anonymous callers with 401', async () => {
    const response = await POST(buildUpload(jpeg(), { title: 'Anything' }))

    expect(response.status).toBe(401)
    expect(uploadFileToR2).not.toHaveBeenCalled()
  })

  it('rejects signed-in non-admins with 401', async () => {
    setSession(userSession())

    const response = await POST(buildUpload(jpeg(), { title: 'Anything' }))

    expect(response.status).toBe(401)
    expect(uploadFileToR2).not.toHaveBeenCalled()
  })

  describe('as an admin', () => {
    beforeEach(() => {
      setSession(adminSession())
    })

    it('uploads to R2 and returns a contract-valid photo', async () => {
      const response = await POST(
        buildUpload(jpeg(), { title: 'Sunset over Taal', isPublic: 'true' })
      )
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(uploadFileToR2).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.stringMatching(/^photos\/\d+-IMG_?20240311_?091200\.jpg$/),
        'image/jpeg'
      )
      expect(PhotoCtor.save).toHaveBeenCalledOnce()
      expect(photoSchema.safeParse(body).success).toBe(true)
      expect(body.imageUrl).toBe('https://cdn.example.com/photos/uploaded.jpg')
      expect(body.isPublic).toBe(true)
    })

    it('defaults isPublic to false when the field is absent', async () => {
      const response = await POST(buildUpload(jpeg(), { title: 'Private one' }))
      const body = await response.json()

      expect(body.isPublic).toBe(false)
    })

    it('stores the resolved capture date when metadata provides one', async () => {
      resolveCapturedAt.mockResolvedValue(new Date('2024-03-11T09:12:00.000Z'))

      const response = await POST(
        buildUpload(jpeg(), {
          title: 'Sunset over Taal',
          capturedAt: '2024-03-11'
        })
      )
      const body = await response.json()

      expect(resolveCapturedAt).toHaveBeenCalledWith(
        expect.any(Buffer),
        'IMG_20240311_091200.jpg',
        '2024-03-11'
      )
      expect(body.capturedAt).toBe('2024-03-11T09:12:00.000Z')
    })

    it('requires a file', async () => {
      const formData = new FormData()
      formData.append('title', 'No file here')

      const response = await POST(
        asNextRequest(
          buildAppRouteRequest('/api/photos', {
            method: 'POST',
            body: formData
          })
        )
      )

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toEqual({
        error: 'File is required'
      })
    })

    it('rejects unsupported file types', async () => {
      const pdf = new File(['%PDF-1.4'], 'invoice.pdf', {
        type: 'application/pdf'
      })

      const response = await POST(buildUpload(pdf, { title: 'Invoice' }))
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error).toMatch(/not a supported image format/)
      expect(uploadFileToR2).not.toHaveBeenCalled()
    })

    it('rejects invalid upload metadata', async () => {
      const response = await POST(
        buildUpload(jpeg(), { title: 'x'.repeat(300) })
      )

      expect(response.status).toBe(400)
      expect(uploadFileToR2).not.toHaveBeenCalled()
    })

    it('answers with a 500 envelope when R2 fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      uploadFileToR2.mockRejectedValue(new Error('bucket unavailable'))

      const response = await POST(buildUpload(jpeg(), { title: 'Sunset' }))

      expect(response.status).toBe(500)
      await expect(response.json()).resolves.toEqual({
        error: 'Failed to upload photo'
      })
    })
  })
})
