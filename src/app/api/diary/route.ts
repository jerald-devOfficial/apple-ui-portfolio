import { auth } from '@/auth'
import { getSessionEmail, isDiaryAdmin } from '@/lib/diary-access'
import Diary from '@/models/Diary'
import dbConnect from '@/utils/db'
import { NextResponse } from 'next/server'

export const GET = async () => {
  try {
    const session = await auth()
    const userEmail = getSessionEmail(session)

    await dbConnect()

    const filter = isDiaryAdmin(session)
      ? {}
      : userEmail
        ? { $or: [{ publicity: true }, { userId: userEmail }] }
        : { publicity: true }

    const diaries = await Diary.find(filter).sort({ createdAt: -1 })

    return NextResponse.json({
      diaries,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: diaries.length,
        itemsPerPage: diaries.length
      }
    })
  } catch (err) {
    console.error('Error fetching diaries:', err)
    return NextResponse.json({ msg: 'Database Error' }, { status: 500 })
  }
}
