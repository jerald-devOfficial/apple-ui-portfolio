import { processContactSubmission } from '@/lib/process-contact'
import { requireAdminSession, unauthorizedResponse } from '@/lib/require-admin'
import { Contact } from '@/models/Contact'
import dbConnect from '@/utils/db'
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

  const result = await processContactSubmission({
    body,
    clientIp: getClientIp(req)
  })

  return NextResponse.json(
    {
      msg: result.msg,
      success: result.success,
      emailSent: result.emailSent
    },
    { status: result.status }
  )
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
