import Diary from '@/models/Diary'
import dbConnect from '@/utils/db'
import { PipelineStage } from 'mongoose'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Get all resources with filters
export const GET = async (req: NextRequest) => {
  try {
    const session = await getToken({ req })

    if (!session) {
      return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const userId = session.email || session.sub

    // Query parameters
    const resourceType = url.searchParams.get('type')
    const search = url.searchParams.get('search')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    await dbConnect()

    // Build the aggregation pipeline
    const pipeline: PipelineStage[] = [
      // Match user's diaries
      {
        $match: {
          userId
        }
      },
      // Only entries with resources
      {
        $match: {
          'resources.0': { $exists: true }
        }
      },
      // Unwind to process each resource separately
      {
        $unwind: '$resources'
      }
    ]

    // Add resource type filter if provided
    if (resourceType) {
      pipeline.push({
        $match: {
          'resources.type': resourceType
        }
      } as PipelineStage)
    }

    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'resources.title': { $regex: search, $options: 'i' } },
            { 'resources.url': { $regex: search, $options: 'i' } }
          ]
        }
      } as PipelineStage)
    }

    // Add projection to shape the output
    pipeline.push({
      $project: {
        diaryId: '$_id',
        diaryTitle: '$title',
        url: '$resources.url',
        title: '$resources.title',
        type: '$resources.type',
        createdAt: '$createdAt'
      }
    } as PipelineStage)

    // Sort by creation date, newest first
    pipeline.push({ $sort: { createdAt: -1 } } as PipelineStage)

    // Get total count for pagination
    const countPipeline = [...pipeline]
    countPipeline.push({ $count: 'total' } as PipelineStage)
    const countResult = await Diary.aggregate(countPipeline)
    const total = countResult.length > 0 ? countResult[0].total : 0

    // Add pagination
    pipeline.push({ $skip: skip } as PipelineStage)
    pipeline.push({ $limit: limit } as PipelineStage)

    // Execute the aggregation
    const resources = await Diary.aggregate(pipeline)

    // Get available resource types for filtering
    const types = await Diary.aggregate([
      { $match: { userId } } as PipelineStage,
      { $unwind: '$resources' } as PipelineStage,
      { $group: { _id: '$resources.type' } } as PipelineStage,
      { $project: { type: '$_id', _id: 0 } } as PipelineStage
    ])

    return NextResponse.json({
      resources,
      types: types.map((t) => t.type),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    })
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json({ msg: 'Database Error' }, { status: 500 })
  }
}
