'use server'

import type { ContactActionState } from '@/app/contact/state'
import { processContactSubmission } from '@/lib/process-contact'
import { headers } from 'next/headers'

const getClientIp = async () => {
  const headerStore = await headers()
  const forwarded = headerStore.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim()
  return headerStore.get('x-real-ip') ?? undefined
}

export const submitContactAction = async (
  prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> => {
  const body = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
    website: formData.get('website'),
    turnstileToken: formData.get('turnstileToken') || undefined
  }

  const result = await processContactSubmission({
    body,
    clientIp: await getClientIp()
  })

  return {
    msg: result.msg,
    success: result.success,
    emailSent: result.emailSent,
    resetKey: result.success
      ? (prevState?.resetKey ?? 0) + 1
      : (prevState?.resetKey ?? 0)
  }
}
