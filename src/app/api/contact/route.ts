import { Contact } from '@/models/Contact'
import connect from '@/utils/db'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { getRandomHexColor } from '@/utils'

export async function POST(req: Request) {
  const { fullName, email, message, subject } = await req.json()

  const avatarColor = getRandomHexColor()
  + '/' + getRandomHexColor();

  try {
    await connect()
  
    await Contact.create({ fullName, email, message, avatarColor, subject })

    return NextResponse.json({
      msg: ['Message sent successfully'],
      success: true
    })
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      let errorList = []
      for (let e in error.errors) {
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
    await connect()

    const contact = await Contact.find()

    return new NextResponse(JSON.stringify(contact), { status: 200 })
  } catch (err) {
    return new NextResponse('Database Error', { status: 500 })
  }
}
