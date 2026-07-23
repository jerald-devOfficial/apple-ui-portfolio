import { auth } from '@/auth'
import { resolveCapturedAt } from '@/lib/photo-metadata.server'
import { getPhotoDisplayDate } from '@/lib/photo-metadata'
import {
  resolveContentType,
  validatePhotoFile
} from '@/lib/photos'
import { uploadFileToR2 } from '@/lib/r2'
import { Photo } from '@/models/Photo'
import dbConnect from '@/utils/db'
import { NextRequest, NextResponse } from 'next/server'

// GET all photos (public ones for non-admin, all for admin)
export const GET = async () => {
  try {
    await dbConnect()
    const session = await auth()

    let photos
    if (session?.user?.role === 'admin') {
      photos = await Photo.find().lean()
    } else {
      photos = await Photo.find({ isPublic: true }).lean()
    }

    photos.sort(
      (a, b) =>
        getPhotoDisplayDate(b).getTime() - getPhotoDisplayDate(a).getTime()
    )

    return NextResponse.json(photos)
  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}

// POST new photo (admin only)
export const POST = async (req: NextRequest) => {
  try {
    const session = await auth()

    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const isPublic = formData.get('isPublic') === 'true'
    const manualCapturedAt = formData.get('capturedAt') as string | null

    if (!file || !title) {
      return NextResponse.json(
        { error: 'File and title are required' },
        { status: 400 }
      )
    }

    const validationError = validatePhotoFile(file)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const contentType = resolveContentType(file)

    // Generate unique key for the file
    const timestamp = Date.now()
    const key = `photos/${timestamp}-${file.name.replace(
      /[^a-zA-Z0-9.-]/g,
      ''
    )}`

    // Upload to R2
    const imageUrl = await uploadFileToR2(buffer, key, contentType)

    const capturedAt = await resolveCapturedAt(
      buffer,
      file.name,
      manualCapturedAt
    )

    // Save to database
    const photo = new Photo({
      title,
      description,
      imageUrl,
      imageKey: key,
      uploadedBy: session.user.email,
      isPublic,
      ...(capturedAt ? { capturedAt } : {})
    })

    await photo.save()

    return NextResponse.json(photo)
  } catch (error) {
    console.error('Error uploading photo:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}
