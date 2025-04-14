import Diary from '@/models/Diary'
import dbConnect from '@/utils/db'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Get statistics about diary usage
export const GET = async (req: NextRequest) => {
  try {
    const session = await getToken({ req })

    if (!session) {
      return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.email || session.sub

    await dbConnect()

    // Total diary entries
    const totalEntries = await Diary.countDocuments({ userId })

    // Entries by category
    const categoryCounts = await Diary.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    // Get top tags
    const topTags = await Diary.aggregate([
      { $match: { userId } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])

    // Count entries by month
    const entriesByMonth = await Diary.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ])

    // Get programming languages used in code snippets
    const languages = await Diary.aggregate([
      { $match: { userId } },
      { $unwind: '$codeSnippets' },
      { $group: { _id: '$codeSnippets.language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])

    // Average word count
    const wordCountStats = await Diary.aggregate([
      { $match: { userId } },
      {
        $project: {
          wordCount: {
            $size: {
              $split: [
                {
                  $replaceAll: {
                    input: {
                      $replaceAll: {
                        input: '$content',
                        find: /<[^>]*>/g,
                        replacement: ' '
                      }
                    },
                    find: /\s+/g,
                    replacement: ' '
                  }
                },
                ' '
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          avgWordCount: { $avg: '$wordCount' },
          minWordCount: { $min: '$wordCount' },
          maxWordCount: { $max: '$wordCount' },
          totalWords: { $sum: '$wordCount' }
        }
      }
    ])

    // Recent activity - last 7 entries
    const recentActivity = await Diary.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(7)
      .select('title updatedAt category tags')

    return NextResponse.json({
      totalEntries,
      categories: categoryCounts.map((c) => ({ name: c._id, count: c.count })),
      topTags: topTags.map((t) => ({ name: t._id, count: t.count })),
      entriesByMonth: entriesByMonth.map((e) => ({
        year: e._id.year,
        month: e._id.month,
        count: e.count
      })),
      languages: languages.map((l) => ({ name: l._id, count: l.count })),
      wordCountStats: wordCountStats.length > 0 ? wordCountStats[0] : null,
      recentActivity
    })
  } catch (error) {
    console.error('Error fetching diary statistics:', error)
    return NextResponse.json({ msg: 'Database Error' }, { status: 500 })
  }
}
