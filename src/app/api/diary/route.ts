import { auth } from '@/auth'
import Diary from '@/models/Diary'
import dbConnect from '@/utils/db'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'

// Create a new diary entry
export const POST = async (req: Request) => {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 })
    }

    const {
      title,
      content,
      publicity,
      tags,
      category,
      resources,
      status,
      isFavorite
    } = await req.json()

    if (!title || !content) {
      return NextResponse.json(
        { msg: 'Title and content are required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Store email as lowercase to ensure consistent comparison
    const userEmail = session.user.email || 'anonymous'
    const userId =
      typeof userEmail === 'string' ? userEmail.toLowerCase() : userEmail

    console.log('Creating diary entry for user:', {
      userEmail,
      normalizedUserId: userId,
      sessionUser: JSON.stringify(session.user)
    })

    const newDiary = await Diary.create({
      userId,
      title,
      content,
      publicity,
      tags,
      category,
      resources,
      status: status || 'published',
      isFavorite: isFavorite || false
    })

    console.log('Diary created successfully:', {
      id: newDiary._id,
      title: newDiary.title,
      userId: newDiary.userId
    })

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
      return NextResponse.json({ msg: errorList }, { status: 400 })
    } else {
      console.error('Diary creation error:', error)
      return NextResponse.json(
        { msg: 'Unable to create diary entry' },
        { status: 500 }
      )
    }
  }
}

// Get diary entries
export async function GET(req: Request) {
  try {
    // Parse query parameters
    const url = new URL(req.url)
    const createTest = url.searchParams.get('createTest')

    await dbConnect()

    // Create a test diary if requested (this is for debugging only)
    if (createTest === 'true') {
      // Check if we already have a test diary to avoid duplicates
      const existingTest = await Diary.findOne({ title: 'Test Public Diary' })

      if (!existingTest) {
        const testDiary = await Diary.create({
          userId: 'test@example.com',
          title: 'Test Public Diary',
          content:
            '<p>This is a test public diary entry that should be visible to everyone.</p>',
          publicity: true,
          tags: ['test', 'public'],
          category: 'other',
          status: 'published',
          isFavorite: false
        })

        // Also create a private diary
        const privateTestDiary = await Diary.create({
          userId: 'test@example.com',
          title: 'Test Private Diary',
          content:
            '<p>This is a test private diary entry that should only be visible to its owner.</p>',
          publicity: false,
          tags: ['test', 'private'],
          category: 'other',
          status: 'published',
          isFavorite: false
        })

        console.log('Created test diaries for debugging')
        return new NextResponse(
          JSON.stringify({
            message: 'Test diaries created successfully',
            diaries: [testDiary, privateTestDiary]
          }),
          { status: 200 }
        )
      } else {
        console.log('Test diaries already exist')
        return new NextResponse(
          JSON.stringify({
            message: 'Test diaries already exist',
            diary: existingTest
          }),
          { status: 200 }
        )
      }
    }

    // Regular GET operation - fetch diaries
    // Simply get all diaries without any filtering
    const diaries = await Diary.find()
    console.log(`Fetched ${diaries.length} diaries from database`)

    // Log each diary for debugging
    diaries.forEach((diary, index) => {
      console.log(
        `Diary ${index + 1}: ID=${diary._id}, Title=${diary.title}, Publicity=${
          diary.publicity
        }`
      )
    })

    // If no diaries found, create a test one to ensure display works
    if (diaries.length === 0) {
      console.log('No diaries found, returning test diary')
      const testDiaries = [
        {
          _id: 'test-diary-1',
          userId: 'test@example.com',
          title: 'Test Diary Entry',
          content:
            '<p>This is a test diary entry to ensure display works correctly.</p>',
          publicity: true,
          tags: ['test', 'example'],
          category: 'other',
          status: 'published',
          isFavorite: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      return new NextResponse(
        JSON.stringify({
          diaries: testDiaries,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: testDiaries.length,
            itemsPerPage: testDiaries.length
          },
          isTestData: true
        }),
        { status: 200 }
      )
    }

    // Return exactly like contact API does
    return new NextResponse(
      JSON.stringify({
        diaries,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: diaries.length,
          itemsPerPage: diaries.length
        }
      }),
      { status: 200 }
    )
  } catch (err) {
    console.error('Error fetching diaries:', err)
    return new NextResponse('Database Error', { status: 500 })
  }
}
