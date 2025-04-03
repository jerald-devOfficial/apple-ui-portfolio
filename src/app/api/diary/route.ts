import { Diary } from '@/models/Diary'
import connect from '@/utils/db'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'

export const POST = async (req: Request) => {
  const { title, content, publicity, tags } = await req.json()

  try {
    await connect()

    const newDiary = await Diary.create({ title, content, publicity, tags })

    return NextResponse.json({
      diary: newDiary,
      message: 'Diary created successfully',
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

export const GET = async () => {
  try {
    await connect()

    const diaries = await Diary.find()

    return new NextResponse(JSON.stringify(diaries), { status: 200 })
  } catch (error) {
    console.log(error)
    return new NextResponse('Database Error', { status: 500 })
  }
}
