import { auth } from '@/auth'
import { deleteFileFromR2 } from '@/lib/r2'
import { Photo } from '@/models/Photo'
import dbConnect from '@/utils/db'
import mongoose from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'

// PUT update photo (admin only)
export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await auth()

    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid photo ID' }, { status: 400 })
    }

    await dbConnect()

    const { title, description, isPublic } = await req.json()

    const photo = await Photo.findByIdAndUpdate(
      id,
      { title, description, isPublic },
      { new: true, runValidators: true }
    )

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    return NextResponse.json(photo)
  } catch (error) {
    console.error('Error updating photo:', error)
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 }
    )
  }
}

// DELETE photo (admin only)
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await auth()

    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid photo ID' }, { status: 400 })
    }

    await dbConnect()

    const photo = await Photo.findById(id)

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Delete from R2
    try {
      await deleteFileFromR2(photo.imageKey)
    } catch (r2Error) {
      console.error('Error deleting from R2:', r2Error)
      // Continue with database deletion even if R2 deletion fails
    }

    // Delete from database
    await Photo.findByIdAndDelete(id)

    return NextResponse.json({ message: 'Photo deleted successfully' })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}
