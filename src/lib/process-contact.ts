import {
  contactFormSchema,
  isTurnstileConfigured
} from '@/lib/contact-validation'
import { sendContactNotification } from '@/lib/email'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { Contact } from '@/models/Contact'
import { getRandomHexColor } from '@/utils'
import dbConnect from '@/utils/db'
import mongoose from 'mongoose'

export type ContactSubmissionResult = {
  msg: string[]
  success: boolean
  emailSent?: boolean
  status: number
}

type ProcessContactOptions = {
  body: unknown
  clientIp?: string
}

export const processContactSubmission = async ({
  body,
  clientIp
}: ProcessContactOptions): Promise<ContactSubmissionResult> => {
  const validated = contactFormSchema.safeParse(body)

  if (!validated.success) {
    return {
      msg: validated.error.issues.map((issue) => issue.message),
      success: false,
      status: 400
    }
  }

  const { fullName, email, message, subject, website, turnstileToken } =
    validated.data

  if (website) {
    return {
      msg: ['Message sent successfully'],
      success: true,
      emailSent: false,
      status: 200
    }
  }

  if (isTurnstileConfigured()) {
    const turnstileResult = await verifyTurnstileToken(
      turnstileToken ?? '',
      clientIp
    )

    if (!turnstileResult.success) {
      return {
        msg: [turnstileResult.error ?? 'Security verification failed.'],
        success: false,
        status: 403
      }
    }
  }

  const avatarColor = getRandomHexColor() + '/' + getRandomHexColor()

  try {
    await dbConnect()

    await Contact.create({ fullName, email, message, avatarColor, subject })

    const { error, skipped } = await sendContactNotification({
      fullName,
      email,
      subject,
      message
    })

    const emailSent = !skipped && !error

    return {
      msg: emailSent
        ? ['Message sent successfully']
        : [
            'Your message was received, but the email notification could not be delivered yet.'
          ],
      success: true,
      emailSent,
      status: 200
    }
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errorList = []
      for (const e in error.errors) {
        errorList.push(error.errors[e].message)
      }
      console.error('contact: validation failed', errorList)
      return { msg: errorList, success: false, status: 400 }
    }

    console.error('contact: failed to save message', error)
    return {
      msg: ['Unable to send message.'],
      success: false,
      status: 500
    }
  }
}
