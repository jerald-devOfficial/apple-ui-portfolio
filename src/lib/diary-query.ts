import { auth } from '@/auth'
import {
  canAccessPrivateDiary,
  getSessionEmail,
  isDiaryAdmin
} from '@/lib/diary-access'
import Diary, { IDiary } from '@/models/Diary'
import { User } from '@/models/User'
import dbConnect from '@/utils/db'
import mongoose from 'mongoose'

const serializeDiary = (
  diary: mongoose.Document,
  liked: boolean
): IDiary => ({
  ...(JSON.parse(JSON.stringify(diary.toObject())) as IDiary),
  liked
})

const getLikedStatus = async (diaryId: string, userEmail?: string) => {
  if (!userEmail) return false

  const user = await User.findOne({ email: userEmail }).select('likedDiaries')
  return (
    user?.likedDiaries?.some((likedId) => String(likedId) === String(diaryId)) ??
    false
  )
}

export const findDiaryForViewer = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return { error: 'invalid' as const }

  await dbConnect()

  const session = await auth()
  const userEmail = getSessionEmail(session)
  const diary = await Diary.findById(id)

  if (!diary) return { error: 'not-found' as const }

  const diaryUserId = diary.userId?.toLowerCase() ?? ''

  if (!diary.publicity && !canAccessPrivateDiary(diaryUserId, session)) {
    return { error: 'unauthorized' as const }
  }

  const liked = await getLikedStatus(String(diary._id), userEmail)
  return { diary: serializeDiary(diary, liked) }
}

export const findDiaryForEditor = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return { error: 'invalid' as const }

  await dbConnect()

  const session = await auth()
  const userEmail = getSessionEmail(session)

  if (!userEmail) return { error: 'unauthorized' as const }

  const diary = await Diary.findById(id)

  if (!diary) return { error: 'not-found' as const }

  const diaryUserId = diary.userId?.toLowerCase() || ''
  const isOwner = diaryUserId === userEmail

  if (!isOwner && !isDiaryAdmin(session)) {
    return { error: 'unauthorized' as const }
  }

  return { diary: serializeDiary(diary, false) }
}
