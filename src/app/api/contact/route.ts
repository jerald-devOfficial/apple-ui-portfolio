import { Contact } from '@/models/Contact'
import { getRandomHexColor } from '@/utils'
import dbConnect from '@/utils/db'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { fullName, email, message, subject } = await req.json()

  const avatarColor = getRandomHexColor() + '/' + getRandomHexColor()

  try {
    await dbConnect()

    await Contact.create({ fullName, email, message, avatarColor, subject })

    return NextResponse.json({
      msg: ['Message sent successfully'],
      success: true
    })
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errorList = []
      for (const e in error.errors) {
        errorList.push(error.errors[e].message)
      }
      console.log(errorList)
      return NextResponse.json({ msg: errorList })
    } else {
      return NextResponse.json({ msg: ['Unable to send message.'] })
    }
  }
}

export async function GET() {
  try {
    await dbConnect()

    const contact = await Contact.find()

    return new NextResponse(JSON.stringify(contact), { status: 200 })
  } catch (err) {
    console.log(err)
    return new NextResponse('Database Error', { status: 500 })
  }
}
