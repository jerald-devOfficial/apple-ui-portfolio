import {
  contactFormSchema,
  isAllowedEmail,
  isAllowedName,
  isTurnstileConfigured,
  normalizeEmail
} from '@/lib/contact-validation'
import { afterEach, describe, expect, it, vi } from 'vitest'

const validSubmission = {
  fullName: 'Jerald Baroro',
  subject: 'Portfolio enquiry',
  email: 'Jerald.Baroro@Gmail.com',
  message: 'I would like to discuss a project with you when you have time.'
}

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Hello@Example.COM  ')).toBe('hello@example.com')
  })
})

describe('isAllowedEmail', () => {
  it('accepts a normal mailbox', () => {
    expect(isAllowedEmail('jerald.baroro@gmail.com')).toEqual({
      valid: true,
      reason: null
    })
  })

  it('rejects disposable addresses', () => {
    const result = isAllowedEmail('throwaway@mailinator.com')

    expect(result.valid).toBe(false)
    expect(result.reason).toMatch(/disposable/i)
  })

  it('rejects malformed local parts', () => {
    expect(isAllowedEmail('.leading@gmail.com').valid).toBe(false)
    expect(isAllowedEmail('double..dot@gmail.com').valid).toBe(false)
  })

  it('rejects an over-long local part', () => {
    const local = 'a'.repeat(65)

    expect(isAllowedEmail(`${local}@gmail.com`).valid).toBe(false)
  })
})

describe('isAllowedName', () => {
  it('accepts names with accents, hyphens and apostrophes', () => {
    expect(isAllowedName("Renée O'Brien-Smith").valid).toBe(true)
    expect(isAllowedName('José Luis Márquez').valid).toBe(true)
  })

  it('rejects typographic apostrophes, which the pattern does not allow', () => {
    expect(isAllowedName('Renée O’Brien').valid).toBe(false)
  })

  it('collapses repeated whitespace before measuring length', () => {
    expect(isAllowedName('  Jerald    Baroro  ').valid).toBe(true)
  })

  it('rejects names shorter than two characters', () => {
    const result = isAllowedName('J')

    expect(result.valid).toBe(false)
    expect(result.reason).toMatch(/between 2 and 50/i)
  })

  it('rejects names longer than 50 characters', () => {
    expect(isAllowedName('a'.repeat(51)).valid).toBe(false)
  })

  it('rejects digits and other symbols', () => {
    expect(isAllowedName('Jerald123').valid).toBe(false)
    expect(isAllowedName('<script>').valid).toBe(false)
  })

  it('rejects names that smuggle in a link', () => {
    expect(isAllowedName('visit www.spam.com').reason).toMatch(/links/i)
  })

  it('rejects an email address before the link rule is reached', () => {
    expect(isAllowedName('spam@spam.io').reason).toMatch(
      /only contain letters/i
    )
  })

  it('rejects keyboard mashing', () => {
    const result = isAllowedName('aaaaaaa')

    expect(result.valid).toBe(false)
    expect(result.reason).toMatch(/valid name/i)
  })
})

describe('contactFormSchema', () => {
  it('accepts a well-formed submission and normalizes the email', () => {
    const result = contactFormSchema.safeParse(validSubmission)

    expect(result.success).toBe(true)
    expect(result.data?.email).toBe('jerald.baroro@gmail.com')
    expect(result.data?.website).toBe('')
  })

  it('rejects a message shorter than 10 characters', () => {
    const result = contactFormSchema.safeParse({
      ...validSubmission,
      message: 'too short'
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.message)).toContain(
      'Message must be at least 10 characters'
    )
  })

  it('rejects links in the subject and the message', () => {
    const subjectResult = contactFormSchema.safeParse({
      ...validSubmission,
      subject: 'Check https://spam.example'
    })
    const messageResult = contactFormSchema.safeParse({
      ...validSubmission,
      message: 'Please visit https://spam.example for a great deal today.'
    })

    expect(subjectResult.error?.issues[0]?.message).toBe(
      'Subject cannot contain links.'
    )
    expect(messageResult.error?.issues[0]?.message).toBe(
      'Message cannot contain links.'
    )
  })

  it('surfaces the name rule from isAllowedName', () => {
    const result = contactFormSchema.safeParse({
      ...validSubmission,
      fullName: 'Jerald123'
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toMatch(/only contain letters/i)
  })

  it('keeps the honeypot value so the pipeline can detect bots', () => {
    const result = contactFormSchema.safeParse({
      ...validSubmission,
      website: 'https://bot.example'
    })

    expect(result.data?.website).toBe('https://bot.example')
  })
})

describe('isTurnstileConfigured', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('is true only when both keys are present', () => {
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'site')
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret')

    expect(isTurnstileConfigured()).toBe(true)
  })

  it('is false when either key is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'site')
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')

    expect(isTurnstileConfigured()).toBe(false)
  })
})
