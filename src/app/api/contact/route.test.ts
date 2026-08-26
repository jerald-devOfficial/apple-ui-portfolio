// @vitest-environment node
import {
  contactListResponseSchema,
  contactSubmitResponseSchema
} from '@/contracts/contact'
import { buildAppRouteRequest, buildJsonRequest } from '@/test/handlerRequest'
import { adminSession, setSession, userSession } from '@/test/mocks/auth'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const dbConnect = vi.hoisted(() => vi.fn())
const contactFind = vi.hoisted(() => vi.fn())
const processContactSubmission = vi.hoisted(() => vi.fn())

vi.mock('@/utils/db', () => ({ default: dbConnect }))
vi.mock('@/auth', async () => (await import('@/test/mocks/auth')).authMock())
vi.mock('@/models/Contact', () => ({ Contact: { find: contactFind } }))
vi.mock('@/lib/process-contact', () => ({ processContactSubmission }))

const { GET, POST } = await import('@/app/api/contact/route')

const message = {
  _id: '65f000000000000000000301',
  fullName: 'Ada Lovelace',
  avatarColor: '#0a84ff',
  email: 'ada@example.com',
  subject: 'Chess repertoire tooling',
  message: 'Loved the write-up on the chess repertoire tooling.',
  read: false,
  createdAt: '2024-06-01T08:30:00.000Z'
}

beforeEach(() => {
  vi.clearAllMocks()
  dbConnect.mockResolvedValue(undefined)
  setSession(null)
  contactFind.mockResolvedValue([message])
  processContactSubmission.mockResolvedValue({
    msg: ['Message sent successfully.'],
    success: true,
    emailSent: true,
    status: 200
  })
})

describe('POST /api/contact', () => {
  const payload = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'Loved the write-up on the chess repertoire tooling.',
    turnstileToken: 'test-token'
  }

  it('returns a contract-valid success envelope', async () => {
    const response = await POST(buildJsonRequest('/api/contact', payload))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(contactSubmitResponseSchema.safeParse(body).success).toBe(true)
    expect(body).toEqual({
      msg: ['Message sent successfully.'],
      success: true,
      emailSent: true
    })
  })

  it('forwards the caller IP from x-forwarded-for', async () => {
    await POST(
      buildJsonRequest('/api/contact', payload, {
        headers: { 'x-forwarded-for': '203.0.113.7, 70.41.3.18' }
      })
    )

    expect(processContactSubmission).toHaveBeenCalledWith({
      body: payload,
      clientIp: '203.0.113.7'
    })
  })

  it('falls back to x-real-ip', async () => {
    await POST(
      buildJsonRequest('/api/contact', payload, {
        headers: { 'x-real-ip': '198.51.100.4' }
      })
    )

    expect(processContactSubmission).toHaveBeenCalledWith({
      body: payload,
      clientIp: '198.51.100.4'
    })
  })

  it('rejects a malformed JSON body without touching the pipeline', async () => {
    const response = await POST(
      buildAppRouteRequest('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'not json'
      })
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({ msg: ['Invalid request body.'], success: false })
    expect(processContactSubmission).not.toHaveBeenCalled()
  })

  it('mirrors the status the pipeline asks for', async () => {
    processContactSubmission.mockResolvedValue({
      msg: ['Please complete the verification challenge.'],
      success: false,
      emailSent: false,
      status: 400
    })

    const response = await POST(buildJsonRequest('/api/contact', payload))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(contactSubmitResponseSchema.safeParse(body).success).toBe(true)
  })
})

describe('GET /api/contact', () => {
  it('rejects anonymous callers with 401', async () => {
    const response = await GET()

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      msg: ['Unauthorized'],
      success: false
    })
    expect(contactFind).not.toHaveBeenCalled()
  })

  it('rejects signed-in non-admins with 401', async () => {
    setSession(userSession())

    const response = await GET()

    expect(response.status).toBe(401)
    expect(contactFind).not.toHaveBeenCalled()
  })

  it('returns a contract-valid list for an admin', async () => {
    setSession(adminSession())

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(contactListResponseSchema.safeParse(body).success).toBe(true)
  })

  it('answers with a 500 when the query throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    setSession(adminSession())
    contactFind.mockRejectedValue(new Error('mongo down'))

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.text()).resolves.toBe('Database Error')
  })
})
