import {
  contactFormSchema,
  isTurnstileConfigured
} from '@/lib/contact-validation'
import { sendContactNotification } from '@/lib/email'
import { requireAdminSession, unauthorizedResponse } from '@/lib/require-admin'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { Contact } from '@/models/Contact'
import { getRandomHexColor } from '@/utils'
import dbConnect from '@/utils/db'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'

const getClientIp = (req: Request) => {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim()
  return req.headers.get('x-real-ip') ?? undefined
}

export async function POST(req: Request) {
  let body: unknown

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { msg: ['Invalid request body.'], success: false },
      { status: 400 }
    )
  }

  const validated = contactFormSchema.safeParse(body)

  if (!validated.success) {
    const errorList = validated.error.issues.map((issue) => issue.message)
    return NextResponse.json({ msg: errorList, success: false }, { status: 400 })
  }

  const { fullName, email, message, subject, website, turnstileToken } =
    validated.data

  if (website) {
    return NextResponse.json({
      msg: ['Message sent successfully'],
      success: true,
      emailSent: false
    })
  }

  if (isTurnstileConfigured()) {
    const turnstileResult = await verifyTurnstileToken(
      turnstileToken ?? '',
      getClientIp(req)
    )

    if (!turnstileResult.success) {
      return NextResponse.json(
        {
          msg: [turnstileResult.error ?? 'Security verification failed.'],
          success: false
        },
        { status: 403 }
      )
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

    return NextResponse.json({
      msg: emailSent
        ? ['Message sent successfully']
        : [
            'Your message was received, but the email notification could not be delivered yet.'
          ],
      success: true,
      emailSent
    })
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errorList = []
      for (const e in error.errors) {
        errorList.push(error.errors[e].message)
      }
      console.error('contact: validation failed', errorList)
      return NextResponse.json({ msg: errorList, success: false }, { status: 400 })
    }

    console.error('contact: failed to save message', error)
    return NextResponse.json({
      msg: ['Unable to send message.'],
      success: false
    })
  }
}

export async function GET() {
  const session = await requireAdminSession()
  if (!session) {
    return unauthorizedResponse()
  }

  try {
    await dbConnect()

    const contact = await Contact.find()

    return new NextResponse(JSON.stringify(contact), { status: 200 })
  } catch (err) {
    console.error('contact: failed to fetch messages', err)
    return new NextResponse('Database Error', { status: 500 })
  }
}
