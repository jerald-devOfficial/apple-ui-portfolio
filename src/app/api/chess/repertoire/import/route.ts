import { auth } from '@/auth'

import { mergePgnIntoTree, treeToPgn } from '@/app/chess/_lib/pgn-tree'

import Repertoire, {
  type IRepertoireLine,
  type IRepertoireSection
} from '@/models/Repertoire'

import dbConnect from '@/utils/db'

import { NextResponse } from 'next/server'

import { z } from 'zod'

const getUserId = (email: string | null | undefined) =>
  (email ?? 'anonymous').toLowerCase()

const importSchema = z.object({
  sectionId: z.string(),

  lineId: z.string(),

  pgn: z.string().min(1)
})

export const POST = async (req: Request) => {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const validated = importSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { msg: 'Invalid import payload' },
        { status: 400 }
      )
    }

    const { sectionId, lineId, pgn } = validated.data

    await dbConnect()

    const userId = getUserId(session.user.email)

    const repertoire = await Repertoire.findOne({ userId })

    if (!repertoire) {
      return NextResponse.json({ msg: 'Repertoire not found' }, { status: 404 })
    }

    const section = repertoire.sections.find(
      (s: IRepertoireSection) => s._id.toString() === sectionId
    )

    if (!section) {
      return NextResponse.json({ msg: 'Section not found' }, { status: 404 })
    }

    const line = section.lines.find(
      (l: IRepertoireLine) => l._id.toString() === lineId
    )

    if (!line) {
      return NextResponse.json({ msg: 'Line not found' }, { status: 404 })
    }

    const merged = mergePgnIntoTree(line.tree, pgn, line.rootFen)

    if (!merged.hasMoves) {
      return NextResponse.json(
        { msg: merged.error ?? 'Could not parse PGN' },

        { status: 400 }
      )
    }

    line.tree = merged.tree

    line.pgn = treeToPgn(line.tree, line.title, line.rootFen)

    repertoire.markModified('sections')

    await repertoire.save()

    return NextResponse.json({ repertoire, success: true })
  } catch (error) {
    console.error('PGN import error:', error)

    return NextResponse.json({ msg: 'Unable to import PGN' }, { status: 500 })
  }
}
