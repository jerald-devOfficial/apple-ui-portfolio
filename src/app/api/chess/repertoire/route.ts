import { auth } from '@/auth'
import { treeToPgn } from '@/app/chess/_lib/pgn-tree'
import Repertoire, {
  createDefaultSections,
  createRootNode,
  type IRepertoire,
  type IRepertoireLine,
  type IRepertoireSection
} from '@/models/Repertoire'
import dbConnect from '@/utils/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const getUserId = (email: string | null | undefined) =>
  (email ?? 'anonymous').toLowerCase()

export const GET = async () => {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const userId = getUserId(session.user.email)

    let repertoire = await Repertoire.findOne({ userId }).lean<IRepertoire>()

    if (!repertoire) {
      const created = await Repertoire.create({
        userId,
        sections: createDefaultSections()
      })
      repertoire = created.toObject() as IRepertoire
    }

    return NextResponse.json({ repertoire, success: true })
  } catch (error) {
    console.error('Repertoire fetch error:', error)
    return NextResponse.json(
      { msg: 'Unable to fetch repertoire' },
      { status: 500 }
    )
  }
}

export const POST = async () => {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const userId = getUserId(session.user.email)

    const existing = await Repertoire.findOne({ userId })
    if (existing) {
      return NextResponse.json({
        repertoire: existing,
        message: 'Repertoire already exists',
        success: true
      })
    }

    const repertoire = await Repertoire.create({
      userId,
      sections: createDefaultSections()
    })

    return NextResponse.json({
      repertoire,
      message: 'Repertoire created',
      success: true
    })
  } catch (error) {
    console.error('Repertoire create error:', error)
    return NextResponse.json(
      { msg: 'Unable to create repertoire' },
      { status: 500 }
    )
  }
}

const patchSchema = z.object({
  update: z.object({
    sectionId: z.string().optional(),
    lineId: z.string().optional(),
    sectionTitle: z.string().optional(),
    lineTitle: z.string().optional(),
    tree: z.unknown().optional(),
    color: z.enum(['white', 'black']).optional(),
    action: z
      .enum([
        'addSection',
        'deleteSection',
        'addLine',
        'deleteLine',
        'updateLineTree',
        'renameSection',
        'renameLine'
      ])
      .optional()
  })
})

type PatchUpdate = z.infer<typeof patchSchema>['update']

type RepertoireDoc = {
  sections: IRepertoireSection[]
  save: () => Promise<unknown>
  markModified: (path: string) => void
}

const findSection = (repertoire: RepertoireDoc, sectionId?: string) =>
  repertoire.sections.find(
    (s: IRepertoireSection) => s._id.toString() === sectionId
  )

const findLine = (section: IRepertoireSection, lineId?: string) =>
  section.lines.find((l: IRepertoireLine) => l._id.toString() === lineId)

const applySectionAction = async (
  repertoire: RepertoireDoc,
  update: PatchUpdate
) => {
  const { action, sectionId } = update

  if (action === 'addSection' && update.sectionTitle && update.color) {
    repertoire.sections.push({
      _id: crypto.randomUUID(),
      title: update.sectionTitle,
      color: update.color,
      order: repertoire.sections.length,
      lines: []
    })
    await repertoire.save()
    return NextResponse.json({ repertoire, success: true })
  }

  if (action === 'deleteSection' && sectionId) {
    repertoire.sections = repertoire.sections.filter(
      (s: IRepertoireSection) => s._id.toString() !== sectionId
    )
    await repertoire.save()
    return NextResponse.json({ repertoire, success: true })
  }

  if (action === 'renameSection' && sectionId && update.sectionTitle) {
    const section = findSection(repertoire, sectionId)
    if (section) {
      section.title = update.sectionTitle
      await repertoire.save()
    }
    return NextResponse.json({ repertoire, success: true })
  }

  return null
}

const applyLineAction = async (
  repertoire: RepertoireDoc,
  section: IRepertoireSection,
  update: PatchUpdate
) => {
  const { action, lineId } = update

  if (action === 'addLine' && update.lineTitle) {
    section.lines.push({
      _id: crypto.randomUUID(),
      title: update.lineTitle,
      order: section.lines.length,
      tree: createRootNode()
    })
    await repertoire.save()
    return NextResponse.json({ repertoire, success: true })
  }

  if (action === 'deleteLine' && lineId) {
    section.lines = section.lines.filter(
      (l: IRepertoireLine) => l._id.toString() !== lineId
    )
    await repertoire.save()
    return NextResponse.json({ repertoire, success: true })
  }

  if (action === 'renameLine' && lineId && update.lineTitle) {
    const line = findLine(section, lineId)
    if (line) {
      line.title = update.lineTitle
      await repertoire.save()
    }
    return NextResponse.json({ repertoire, success: true })
  }

  if (action === 'updateLineTree' && lineId && update.tree) {
    const line = findLine(section, lineId)
    if (line) {
      line.tree = update.tree as typeof line.tree
      line.pgn = treeToPgn(line.tree, line.title, line.rootFen)
      repertoire.markModified('sections')
      await repertoire.save()
    }
    return NextResponse.json({ repertoire, success: true })
  }

  return null
}

export const PATCH = async (req: Request) => {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = patchSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { msg: 'Invalid update payload' },
        { status: 400 }
      )
    }

    const { update } = validated.data
    await dbConnect()
    const userId = getUserId(session.user.email)

    const repertoire = await Repertoire.findOne({ userId })
    if (!repertoire) {
      return NextResponse.json({ msg: 'Repertoire not found' }, { status: 404 })
    }

    const sectionResponse = await applySectionAction(
      repertoire as RepertoireDoc,
      update
    )
    if (sectionResponse) return sectionResponse

    const section = findSection(repertoire, update.sectionId)
    if (!section) {
      return NextResponse.json({ msg: 'Section not found' }, { status: 404 })
    }

    const lineResponse = await applyLineAction(
      repertoire as RepertoireDoc,
      section,
      update
    )
    if (lineResponse) return lineResponse

    return NextResponse.json({ msg: 'No valid update action' }, { status: 400 })
  } catch (error) {
    console.error('Repertoire patch error:', error)
    return NextResponse.json(
      { msg: 'Unable to update repertoire' },
      { status: 500 }
    )
  }
}
