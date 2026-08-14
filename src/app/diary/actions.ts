'use server'

import type { DiaryActionState } from '@/app/diary/state'
import { auth } from '@/auth'
import { getSessionEmail, isDiaryAdmin } from '@/lib/diary-access'
import { parseDiaryFormData } from '@/lib/diary-fields'
import Diary from '@/models/Diary'
import dbConnect from '@/utils/db'
import mongoose from 'mongoose'
import { redirect } from 'next/navigation'

export const createDiaryAction = async (
  _prevState: DiaryActionState,
  formData: FormData
): Promise<DiaryActionState> => {
  const session = await auth()
  const userEmail = getSessionEmail(session)

  if (!userEmail) {
    return { success: false, error: 'Unauthorized' }
  }

  const parsed = parseDiaryFormData(formData)

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid diary entry'
    }
  }

  try {
    await dbConnect()
    await Diary.create({
      userId: userEmail,
      title: parsed.data.title,
      content: parsed.data.content,
      publicity: parsed.data.publicity,
      tags: parsed.data.tags,
      status: 'published'
    })
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const first = Object.values(error.errors)[0]?.message
      return { success: false, error: first ?? 'Unable to save diary entry' }
    }

    console.error('Diary creation error:', error)
    return { success: false, error: 'Unable to save diary entry' }
  }

  redirect('/diaries')
}

export const updateDiaryAction = async (
  _prevState: DiaryActionState,
  formData: FormData
): Promise<DiaryActionState> => {
  const session = await auth()
  const userEmail = getSessionEmail(session)
  const id = String(formData.get('diaryId') ?? '')

  if (!userEmail) {
    return { success: false, error: 'Unauthorized' }
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { success: false, error: 'Invalid diary ID' }
  }

  const parsed = parseDiaryFormData(formData)

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid update'
    }
  }

  try {
    await dbConnect()

    const diary = await Diary.findById(id)

    if (!diary) {
      return { success: false, error: 'Diary not found' }
    }

    const diaryUserId = diary.userId?.toLowerCase() || ''
    const isOwner = diaryUserId === userEmail

    if (!isOwner && !isDiaryAdmin(session)) {
      return { success: false, error: 'Unauthorized' }
    }

    await Diary.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      { runValidators: true }
    )
  } catch (error) {
    console.error('Error updating diary:', error)
    return { success: false, error: 'Unable to update diary entry' }
  }

  redirect(`/diary/${id}`)
}

export const deleteDiaryAction = async (id: string) => {
  const session = await auth()
  const userEmail = getSessionEmail(session)

  if (!userEmail || !mongoose.Types.ObjectId.isValid(id)) {
    return { success: false, error: 'Unauthorized' }
  }

  await dbConnect()

  const diary = await Diary.findById(id)

  if (!diary) {
    return { success: false, error: 'Diary not found' }
  }

  const diaryUserId = diary.userId?.toLowerCase() || ''
  const isOwner = diaryUserId === userEmail

  if (!isOwner && !isDiaryAdmin(session)) {
    return { success: false, error: 'Unauthorized' }
  }

  await Diary.deleteOne({ _id: id })
  redirect('/diaries')
}
