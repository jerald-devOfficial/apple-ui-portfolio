import { requireAdminSession, unauthorizedResponse } from '@/lib/require-admin'
import { Contact } from '@/models/Contact'
import dbConnect from '@/utils/db'
import { NextResponse } from 'next/server'

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await requireAdminSession()
  if (!session) {
    return unauthorizedResponse()
  }

  try {
    await dbConnect()
    const { id } = await params
    const body = await request.json()

    let updatedMail
    if (body.read) {
      updatedMail = await Contact.findByIdAndUpdate(
        id,
        { read: true },
        { new: true }
      )
    } else if (body.unread) {
      updatedMail = await Contact.findByIdAndUpdate(
        id,
        { read: false },
        { new: true }
      )
    } else {
      return NextResponse.json(
        { msg: ['Invalid request body'], success: false },
        { status: 400 }
      )
    }

    if (!updatedMail) {
      return NextResponse.json(
        { msg: ['Message not found'], success: false },
        { status: 404 }
      )
    }

    return new NextResponse(JSON.stringify(updatedMail), { status: 200 })
  } catch (err) {
    console.error('Error while processing PATCH request:', err)
    return new NextResponse('Database Error', { status: 500 })
  }
}

export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await requireAdminSession()
  if (!session) {
    return unauthorizedResponse()
  }

  try {
    await dbConnect()
    const { id } = await params

    const deletedMail = await Contact.findByIdAndDelete(id)

    if (!deletedMail) {
      return NextResponse.json(
        { msg: ['Message not found'], success: false },
        { status: 404 }
      )
    }

    return new NextResponse(JSON.stringify(deletedMail), { status: 200 })
  } catch (err) {
    console.error('Error while processing DELETE request:', err)
    return new NextResponse('Database Error', { status: 500 })
  }
}
