// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const dbConnect = vi.hoisted(() => vi.fn())
const contactCreate = vi.hoisted(() => vi.fn())
const sendContactNotification = vi.hoisted(() => vi.fn())
const verifyTurnstileToken = vi.hoisted(() => vi.fn())

vi.mock('@/utils/db', () => ({ default: dbConnect }))
vi.mock('@/models/Contact', () => ({ Contact: { create: contactCreate } }))
vi.mock('@/lib/email', () => ({ sendContactNotification }))
vi.mock('@/lib/turnstile', () => ({ verifyTurnstileToken }))

const { processContactSubmission } = await import('@/lib/process-contact')

const validBody = {
  fullName: 'Jerald Baroro',
  subject: 'Portfolio enquiry',
  email: 'jerald.baroro@gmail.com',
  message: 'I would like to discuss a project with you when you have time.'
}

beforeEach(() => {
  vi.clearAllMocks()
  dbConnect.mockResolvedValue(undefined)
  contactCreate.mockResolvedValue({ _id: 'contact-1' })
  sendContactNotification.mockResolvedValue({ error: null, skipped: false })
  verifyTurnstileToken.mockResolvedValue({ success: true })
})

afterEach(() => {
  vi.unstubAllEnvs()
})

const enableTurnstile = () => {
  vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'site')
  vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret')
}

describe('processContactSubmission', () => {
  it('stores the message and reports a delivered email', async () => {
    const result = await processContactSubmission({ body: validBody })

    expect(result).toMatchObject({
      success: true,
      emailSent: true,
      status: 200,
      msg: ['Message sent successfully']
    })
    expect(contactCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'Jerald Baroro',
        email: 'jerald.baroro@gmail.com',
        subject: 'Portfolio enquiry'
      })
    )
  })

  it('warns when the message is stored but the email is skipped', async () => {
    sendContactNotification.mockResolvedValue({ error: null, skipped: true })

    const result = await processContactSubmission({ body: validBody })

    expect(result.success).toBe(true)
    expect(result.emailSent).toBe(false)
    expect(result.msg[0]).toMatch(/could not be delivered/i)
  })

  it('returns every validation message without touching the database', async () => {
    const result = await processContactSubmission({
      body: { ...validBody, message: 'short', fullName: 'J' }
    })

    expect(result.status).toBe(400)
    expect(result.success).toBe(false)
    expect(result.msg.length).toBeGreaterThan(1)
    expect(dbConnect).not.toHaveBeenCalled()
    expect(contactCreate).not.toHaveBeenCalled()
  })

  it('silently accepts honeypot submissions without persisting them', async () => {
    const result = await processContactSubmission({
      body: { ...validBody, website: 'https://bot.example' }
    })

    expect(result).toMatchObject({
      success: true,
      emailSent: false,
      status: 200
    })
    expect(contactCreate).not.toHaveBeenCalled()
    expect(verifyTurnstileToken).not.toHaveBeenCalled()
  })

  it('skips Turnstile verification when it is not configured', async () => {
    await processContactSubmission({ body: validBody })

    expect(verifyTurnstileToken).not.toHaveBeenCalled()
  })

  it('verifies Turnstile with the client IP when configured', async () => {
    enableTurnstile()

    await processContactSubmission({
      body: { ...validBody, turnstileToken: 'token-123' },
      clientIp: '203.0.113.5'
    })

    expect(verifyTurnstileToken).toHaveBeenCalledWith(
      'token-123',
      '203.0.113.5'
    )
  })

  it('rejects a failed Turnstile challenge with 403', async () => {
    enableTurnstile()
    verifyTurnstileToken.mockResolvedValue({
      success: false,
      error: 'Security verification failed. Please try again.'
    })

    const result = await processContactSubmission({ body: validBody })

    expect(result.status).toBe(403)
    expect(result.success).toBe(false)
    expect(result.msg).toEqual([
      'Security verification failed. Please try again.'
    ])
    expect(contactCreate).not.toHaveBeenCalled()
  })

  it('reports a 500 when persistence fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    contactCreate.mockRejectedValue(new Error('mongo down'))

    const result = await processContactSubmission({ body: validBody })

    expect(result).toMatchObject({
      success: false,
      status: 500,
      msg: ['Unable to send message.']
    })
  })
})
