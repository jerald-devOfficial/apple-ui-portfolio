// @vitest-environment node
import { blogListResponseSchema, blogResponseSchema } from '@/contracts/blog'
import { errorResponseSchema } from '@/contracts/shared'
import { buildAppRouteRequest, buildJsonRequest } from '@/test/handlerRequest'
// Blog resolves admin rights from the Admin collection, not the session role.
import { setSession, userSession } from '@/test/mocks/auth'
import { modelConstructor, queryChain } from '@/test/mocks/mongoose'
import type { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const dbConnect = vi.hoisted(() => vi.fn())
const adminFindOne = vi.hoisted(() => vi.fn())
const blogFind = vi.hoisted(() => vi.fn())
const blogFindOne = vi.hoisted(() => vi.fn())
const blogCountDocuments = vi.hoisted(() => vi.fn())

vi.mock('@/utils/db', () => ({ default: dbConnect }))
vi.mock('@/auth', async () => (await import('@/test/mocks/auth')).authMock())
vi.mock('@/models/Admin', () => ({ Admin: { findOne: adminFindOne } }))

const BlogCtor = modelConstructor({
  _id: '65f000000000000000000101',
  featured: false,
  likes: 0,
  views: 0,
  readTime: 1,
  commentCount: 0
})

vi.mock('@/models/Blog', () => {
  Object.assign(BlogCtor, {
    find: blogFind,
    findOne: blogFindOne,
    countDocuments: blogCountDocuments
  })
  return { Blog: BlogCtor, default: BlogCtor }
})

const { GET, POST } = await import('@/app/api/blog/route')

const publishedBlog = {
  _id: '65f000000000000000000101',
  userId: '65f000000000000000000001',
  title: 'Shipping a testing harness',
  slug: 'shipping-a-testing-harness',
  summary: 'How the layers fit together.',
  content: '<p>Body</p>',
  contentBlocks: [],
  tags: ['testing'],
  category: 'technology',
  status: 'published',
  featured: false,
  author: { name: 'Jerald Baroro', email: 'owner@example.com' },
  createdAt: '2024-05-01T10:00:00.000Z'
}

const admin = {
  _id: '65f000000000000000000001',
  name: 'Jerald Baroro',
  email: 'owner@example.com'
}

const asNextRequest = (request: Request) => request as unknown as NextRequest

beforeEach(() => {
  vi.clearAllMocks()
  dbConnect.mockResolvedValue(undefined)
  setSession(null)
  adminFindOne.mockResolvedValue(null)
  blogFind.mockReturnValue(queryChain([publishedBlog]))
  blogFindOne.mockResolvedValue(null)
  blogCountDocuments.mockResolvedValue(1)
})

describe('GET /api/blog', () => {
  it('returns a contract-valid list with pagination', async () => {
    const response = await GET(asNextRequest(buildAppRouteRequest('/api/blog')))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(blogListResponseSchema.safeParse(body).success).toBe(true)
    expect(body.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      pages: 1
    })
  })

  it('restricts anonymous callers to published entries', async () => {
    await GET(asNextRequest(buildAppRouteRequest('/api/blog')))

    expect(blogFind).toHaveBeenCalledWith({ status: 'published' })
  })

  it('restricts signed-in non-admins to published entries', async () => {
    setSession(userSession())

    await GET(asNextRequest(buildAppRouteRequest('/api/blog')))

    expect(adminFindOne).toHaveBeenCalledWith({ email: 'reader@example.com' })
    expect(blogFind).toHaveBeenCalledWith({ status: 'published' })
  })

  it('lets an admin see drafts and private entries', async () => {
    setSession(userSession('owner@example.com'))
    adminFindOne.mockResolvedValue(admin)

    await GET(asNextRequest(buildAppRouteRequest('/api/blog')))

    expect(blogFind).toHaveBeenCalledWith({})
  })

  it('translates category, featured and search filters into the query', async () => {
    await GET(
      asNextRequest(
        buildAppRouteRequest(
          '/api/blog?category=design&featured=true&search=msw'
        )
      )
    )

    expect(blogFind).toHaveBeenCalledWith({
      status: 'published',
      category: 'design',
      featured: true,
      $text: { $search: 'msw' }
    })
  })

  it('applies pagination offsets', async () => {
    const chain = queryChain([publishedBlog])
    blogFind.mockReturnValue(chain)
    blogCountDocuments.mockResolvedValue(25)

    const response = await GET(
      asNextRequest(buildAppRouteRequest('/api/blog?page=3&limit=5'))
    )
    const body = await response.json()

    expect(chain.skip).toHaveBeenCalledWith(10)
    expect(chain.limit).toHaveBeenCalledWith(5)
    expect(body.pagination).toEqual({ page: 3, limit: 5, total: 25, pages: 5 })
  })

  it('reports a 500 when the query throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    blogFind.mockImplementation(() => {
      throw new Error('mongo down')
    })

    const response = await GET(asNextRequest(buildAppRouteRequest('/api/blog')))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(errorResponseSchema.safeParse(body).success).toBe(true)
  })
})

describe('POST /api/blog', () => {
  const validPayload = {
    title: 'Shipping a testing harness',
    summary: 'How the layers fit together.',
    content: '<p>Body</p>'
  }

  it('rejects anonymous callers with 401', async () => {
    const response = await POST(
      asNextRequest(buildJsonRequest('/api/blog', validPayload))
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' })
  })

  it('rejects non-admin sessions with 403', async () => {
    setSession(userSession())

    const response = await POST(
      asNextRequest(buildJsonRequest('/api/blog', validPayload))
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      error: 'Admin access required'
    })
  })

  describe('as an admin', () => {
    beforeEach(() => {
      setSession(userSession('owner@example.com'))
      adminFindOne.mockResolvedValue(admin)
    })

    it('creates a contract-valid blog and derives the slug', async () => {
      const response = await POST(
        asNextRequest(buildJsonRequest('/api/blog', validPayload))
      )
      const body = await response.json()

      expect(response.status).toBe(201)
      expect(body.slug).toBe('shipping-a-testing-harness')
      expect(body.status).toBe('draft')
      expect(blogResponseSchema.safeParse(body).success).toBe(true)
    })

    it('accepts the payload nested under `update`', async () => {
      const response = await POST(
        asNextRequest(buildJsonRequest('/api/blog', { update: validPayload }))
      )

      expect(response.status).toBe(201)
    })

    it('requires a title, summary and some content', async () => {
      const response = await POST(
        asNextRequest(buildJsonRequest('/api/blog', { title: 'Only a title' }))
      )
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error).toMatch(/are required/i)
    })

    it('accepts a blog built only from content blocks', async () => {
      const response = await POST(
        asNextRequest(
          buildJsonRequest('/api/blog', {
            title: 'Blocks only',
            summary: 'No legacy content field.',
            contentBlocks: [
              { id: 'b1', type: 'text', content: 'Hello', order: 0 }
            ]
          })
        )
      )

      expect(response.status).toBe(201)
    })

    it('rejects a duplicate slug', async () => {
      blogFindOne.mockResolvedValue(publishedBlog)

      const response = await POST(
        asNextRequest(buildJsonRequest('/api/blog', validPayload))
      )
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error).toBe('Blog with this title already exists')
    })
  })
})
