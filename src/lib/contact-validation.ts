import MailChecker from 'mailchecker'
import { z } from 'zod'

const URL_PATTERN = /(?:https?:\/\/|www\.)/i
const DOMAIN_IN_TEXT_PATTERN =
  /\b[\w-]+\.(com|net|org|io|xyz|co|me|info|biz|ru|cn|tk|ml|ga|cf|gq)\b/i
const REPEATED_CHAR_PATTERN = /(.)\1{4,}/

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const isAllowedEmail = (email: string) => {
  const normalized = normalizeEmail(email)

  if (!MailChecker.isValid(normalized)) {
    return {
      valid: false,
      reason: 'Disposable or invalid email addresses are not allowed.'
    }
  }

  const [localPart, domain] = normalized.split('@')

  if (!localPart || !domain || localPart.length > 64 || domain.length > 255) {
    return { valid: false, reason: 'Invalid email address.' }
  }

  if (
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    localPart.includes('..')
  ) {
    return { valid: false, reason: 'Invalid email address.' }
  }

  return { valid: true, reason: null }
}

export const isAllowedName = (name: string) => {
  const trimmed = name.trim().replace(/\s+/g, ' ')

  if (trimmed.length < 2 || trimmed.length > 50) {
    return { valid: false, reason: 'Name must be between 2 and 50 characters.' }
  }

  if (!/^[\p{L}][\p{L}\p{M}'.\-\s]*[\p{L}\p{M}.]?$/u.test(trimmed)) {
    return {
      valid: false,
      reason:
        'Name may only contain letters, spaces, hyphens, apostrophes, or periods.'
    }
  }

  const letterCount = (trimmed.match(/\p{L}/gu) ?? []).length

  if (letterCount < 2) {
    return { valid: false, reason: 'Please enter your full name.' }
  }

  if (
    URL_PATTERN.test(trimmed) ||
    DOMAIN_IN_TEXT_PATTERN.test(trimmed) ||
    trimmed.includes('@')
  ) {
    return {
      valid: false,
      reason: 'Name cannot contain links or email addresses.'
    }
  }

  if (REPEATED_CHAR_PATTERN.test(trimmed)) {
    return { valid: false, reason: 'Please enter a valid name.' }
  }

  return { valid: true, reason: null }
}

export const contactFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Name must be larger than 2 characters')
    .max(50, 'Name must be lesser than 50 characters')
    .superRefine((value, ctx) => {
      const result = isAllowedName(value)
      if (!result.valid && result.reason) {
        ctx.addIssue({ code: 'custom', message: result.reason })
      }
    }),
  subject: z
    .string()
    .trim()
    .min(2, 'Subject must be larger than 2 characters')
    .max(80, 'Subject must be lesser than 80 characters')
    .refine((value) => !URL_PATTERN.test(value), {
      message: 'Subject cannot contain links.'
    }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: 'Invalid email address.' }))
    .superRefine((value, ctx) => {
      const result = isAllowedEmail(value)
      if (!result.valid && result.reason) {
        ctx.addIssue({ code: 'custom', message: result.reason })
      }
    }),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(800, 'Message maximum is 800 characters')
    .refine((value) => !URL_PATTERN.test(value), {
      message: 'Message cannot contain links.'
    }),
  website: z.string().optional().default(''),
  turnstileToken: z.string().optional()
})

export type ContactFormInput = z.infer<typeof contactFormSchema>

export const isTurnstileConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
    process.env.TURNSTILE_SECRET_KEY
  )
