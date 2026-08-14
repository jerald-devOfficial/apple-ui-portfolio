import { auth } from '@/auth'
import Diary from '@/models/Diary'
import { User } from '@/models/User'
import dbConnect from '@/utils/db'
import mongoose from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to like diaries' },
        { status: 401 }
      )
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid diary ID' }, { status: 400 })
    }

    await dbConnect()

    const diary = await Diary.findById(id)
    if (!diary) {
      return NextResponse.json({ error: 'Diary not found' }, { status: 404 })
    }

    const email = session.user.email.toLowerCase()
    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const diaryId = diary._id
    const hasLiked = (user.likedDiaries ?? []).some(
      (likedId) => String(likedId) === String(diaryId)
    )

    if (hasLiked) {
      await User.updateOne(
        { _id: user._id },
        { $pull: { likedDiaries: { $in: [diaryId, String(diaryId)] } } }
      )
    } else {
      await User.updateOne(
        { _id: user._id },
        { $addToSet: { likedDiaries: diaryId } }
      )
    }

    return NextResponse.json({ liked: !hasLiked })
  } catch (error) {
    console.error('Error liking diary:', error)
    return NextResponse.json({ error: 'Failed to like diary' }, { status: 500 })
  }
}
