// @vitest-environment node
import { STARTING_FEN } from '@/app/chess/_lib/board-theme'
import { repertoireResponseSchema } from '@/contracts/chess'
import { buildJsonRequest } from '@/test/handlerRequest'
import { setSession, userSession } from '@/test/mocks/auth'
import { queryChain } from '@/test/mocks/mongoose'
import type { IRepertoireSection } from '@/models/Repertoire'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const dbConnect = vi.hoisted(() => vi.fn())
const repertoireFindOne = vi.hoisted(() => vi.fn())
const repertoireCreate = vi.hoisted(() => vi.fn())

vi.mock('@/utils/db', () => ({ default: dbConnect }))
vi.mock('@/auth', async () => (await import('@/test/mocks/auth')).authMock())
vi.mock('@/models/Repertoire', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/models/Repertoire')>()

  return {
    ...actual,
    default: { findOne: repertoireFindOne, create: repertoireCreate }
  }
})

const { GET, PATCH, POST } = await import('@/app/api/chess/repertoire/route')

/** Mixed case on purpose: the handler keys the repertoire by a lowercased email. */
const session = userSession('Owner@Example.com')

const buildSection = (): IRepertoireSection =>
  ({
    _id: 'section-1',
    title: 'White — 1. e4',
    color: 'white',
    order: 0,
    lines: [
      {
        _id: 'line-1',
        title: 'Italian Game',
        order: 0,
        tree: {
          _id: 'root',
          san: '',
          fen: STARTING_FEN,
          mainLine: null,
          variations: []
        }
      }
    ]
  }) as unknown as IRepertoireSection

/** A stand-in for the Mongoose document the PATCH branches mutate in place. */
const buildRepertoireDoc = () => {
  const doc = {
    _id: '65f000000000000000000501',
    userId: 'owner@example.com',
    sections: [buildSection()],
    save: vi.fn().mockResolvedValue(undefined),
    markModified: vi.fn()
  }

  return doc
}

let doc: ReturnType<typeof buildRepertoireDoc>

const patch = (update: Record<string, unknown>) =>
  PATCH(
    buildJsonRequest('/api/chess/repertoire', { update }, { method: 'PATCH' })
  )

beforeEach(() => {
  vi.clearAllMocks()
  dbConnect.mockResolvedValue(undefined)
  setSession(session)
  doc = buildRepertoireDoc()
  repertoireFindOne.mockReturnValue(queryChain(doc))
  repertoireCreate.mockResolvedValue({ ...doc, toObject: () => doc })
})

describe('GET /api/chess/repertoire', () => {
  it('rejects anonymous callers with 401', async () => {
    setSession(null)

    const response = await GET()

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ msg: 'Unauthorized' })
  })

  it('returns a contract-valid repertoire keyed by the lowercased email', async () => {
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(repertoireFindOne).toHaveBeenCalledWith({
      userId: 'owner@example.com'
    })
    expect(repertoireResponseSchema.safeParse(body).success).toBe(true)
  })

  it('creates a default repertoire on first visit', async () => {
    repertoireFindOne.mockReturnValue(queryChain(null))

    const response = await GET()

    expect(response.status).toBe(200)
    expect(repertoireCreate).toHaveBeenCalledWith({
      userId: 'owner@example.com',
      sections: expect.any(Array)
    })
  })

  it('answers with a 500 envelope when the lookup throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    repertoireFindOne.mockImplementation(() => {
      throw new Error('mongo down')
    })

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      msg: 'Unable to fetch repertoire'
    })
  })
})

describe('POST /api/chess/repertoire', () => {
  it('rejects anonymous callers with 401', async () => {
    setSession(null)

    expect((await POST()).status).toBe(401)
  })

  it('is idempotent when a repertoire already exists', async () => {
    const response = await POST()
    const body = await response.json()

    expect(body.message).toBe('Repertoire already exists')
    expect(repertoireCreate).not.toHaveBeenCalled()
  })

  it('creates one when it is missing', async () => {
    repertoireFindOne.mockReturnValue(queryChain(null))

    const response = await POST()
    const body = await response.json()

    expect(body.message).toBe('Repertoire created')
    expect(repertoireCreate).toHaveBeenCalledOnce()
  })
})

describe('PATCH /api/chess/repertoire', () => {
  it('rejects anonymous callers with 401', async () => {
    setSession(null)

    expect((await patch({ action: 'addSection' })).status).toBe(401)
  })

  it('rejects a payload that is not shaped like an update', async () => {
    const response = await PATCH(
      buildJsonRequest(
        '/api/chess/repertoire',
        { sectionId: 'section-1' },
        { method: 'PATCH' }
      )
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      msg: 'Invalid update payload'
    })
  })

  it('404s when the user has no repertoire yet', async () => {
    repertoireFindOne.mockReturnValue(queryChain(null))

    const response = await patch({ action: 'addSection' })

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      msg: 'Repertoire not found'
    })
  })

  it('adds a section', async () => {
    const response = await patch({
      action: 'addSection',
      sectionTitle: 'Black — Caro-Kann',
      color: 'black'
    })

    expect(response.status).toBe(200)
    expect(doc.sections).toHaveLength(2)
    expect(doc.sections[1]).toMatchObject({
      title: 'Black — Caro-Kann',
      color: 'black',
      order: 1,
      lines: []
    })
    expect(doc.save).toHaveBeenCalledOnce()
  })

  it('deletes a section', async () => {
    const response = await patch({
      action: 'deleteSection',
      sectionId: 'section-1'
    })

    expect(response.status).toBe(200)
    expect(doc.sections).toHaveLength(0)
    expect(doc.save).toHaveBeenCalledOnce()
  })

  it('renames a section', async () => {
    await patch({
      action: 'renameSection',
      sectionId: 'section-1',
      sectionTitle: 'White — King’s Pawn'
    })

    expect(doc.sections[0].title).toBe('White — King’s Pawn')
  })

  it('404s when the section for a line action is missing', async () => {
    const response = await patch({
      action: 'addLine',
      sectionId: 'nope',
      lineTitle: 'Ruy Lopez'
    })

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ msg: 'Section not found' })
  })

  it('adds a line with a root node', async () => {
    await patch({
      action: 'addLine',
      sectionId: 'section-1',
      lineTitle: 'Ruy Lopez'
    })

    expect(doc.sections[0].lines).toHaveLength(2)
    expect(doc.sections[0].lines[1]).toMatchObject({ title: 'Ruy Lopez' })
    expect(doc.sections[0].lines[1].tree).toBeDefined()
  })

  it('deletes a line', async () => {
    await patch({
      action: 'deleteLine',
      sectionId: 'section-1',
      lineId: 'line-1'
    })

    expect(doc.sections[0].lines).toHaveLength(0)
  })

  it('renames a line', async () => {
    await patch({
      action: 'renameLine',
      sectionId: 'section-1',
      lineId: 'line-1',
      lineTitle: 'Giuoco Piano'
    })

    expect(doc.sections[0].lines[0].title).toBe('Giuoco Piano')
  })

  it('stores the tree and regenerates the PGN', async () => {
    const tree = {
      _id: 'root',
      san: '',
      fen: STARTING_FEN,
      mainLine: {
        _id: 'n1',
        san: 'e4',
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
        mainLine: null,
        variations: []
      },
      variations: []
    }

    await patch({
      action: 'updateLineTree',
      sectionId: 'section-1',
      lineId: 'line-1',
      tree
    })

    expect(doc.sections[0].lines[0].tree).toEqual(tree)
    expect(doc.sections[0].lines[0].pgn).toContain('1. e4')
    expect(doc.markModified).toHaveBeenCalledWith('sections')
  })

  it('rejects an action it does not recognise', async () => {
    const response = await patch({ sectionId: 'section-1' })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      msg: 'No valid update action'
    })
  })
})
