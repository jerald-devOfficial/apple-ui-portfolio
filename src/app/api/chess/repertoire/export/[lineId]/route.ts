import { auth } from '@/auth'
import { treeToPgn } from '@/app/chess/_lib/pgn-tree'
import Repertoire, {
  type IRepertoireLine,
  type IRepertoireSection
} from '@/models/Repertoire'
import dbConnect from '@/utils/db'
import { NextRequest, NextResponse } from 'next/server'

const getUserId = (email: string | null | undefined) =>
  (email ?? 'anonymous').toLowerCase()

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ lineId: string }> }
) => {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 })
    }

    const { lineId } = await params
    const sectionId = req.nextUrl.searchParams.get('sectionId')

    if (!sectionId) {
      return NextResponse.json({ msg: 'sectionId required' }, { status: 400 })
    }

    await dbConnect()
    const userId = getUserId(session.user.email)
    const repertoire = await Repertoire.findOne({ userId })

    if (!repertoire) {
      return NextResponse.json({ msg: 'Repertoire not found' }, { status: 404 })
    }

    const section = repertoire.sections.find(
      (s: IRepertoireSection) => s._id.toString() === sectionId
    )
    const line = section?.lines.find(
      (l: IRepertoireLine) => l._id.toString() === lineId
    )

    if (!line) {
      return NextResponse.json({ msg: 'Line not found' }, { status: 404 })
    }

    const pgn = line.pgn ?? treeToPgn(line.tree, line.title, line.rootFen)
    const safeName = line.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const filename = `${safeName || 'repertoire-line'}.pgn`

    return new NextResponse(pgn, {
      headers: {
        'Content-Type': 'application/x-chess-pgn',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('PGN export error:', error)
    return NextResponse.json({ msg: 'Unable to export PGN' }, { status: 500 })
  }
}
