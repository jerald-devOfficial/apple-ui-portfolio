import connect from '@/utils/db'
import { NextResponse } from 'next/server';
import mongoose from 'mongoose'
import { Diary } from '@/models/Diary'

export const POST = async (req: Request) => {
  const { title, content } = await req.json();

  try {
    await connect();

    const newDiary = await Diary.create({ title, content });

    return NextResponse.json({
      diary: newDiary,
      message: 'Diary created successfully',
      success: true
    });
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
};

export const GET = async () => {
  try {
    await connect();

    const diaries = await Diary.find();

    return new NextResponse(JSON.stringify(diaries), { status: 200 });
  } catch (error) {
    return new NextResponse('Database Error', { status: 500 });
  }
};