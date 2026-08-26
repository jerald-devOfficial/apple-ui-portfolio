import { STARTING_FEN } from '@/app/chess/_lib/board-theme'
import {
  appendMainLineMove,
  appendVariationMove,
  cloneNode,
  collectLinearPath,
  ensureNodeIds,
  findNodeByPath,
  getFenAtPath,
  getMoveNumber,
  getParentContext,
  getPathToNode,
  isWhiteToMoveFromPath,
  promoteVariation,
  tryMove,
  updateNodeAnnotation
} from '@/app/chess/_lib/move-tree-utils'
import type { IMoveNode } from '@/models/Repertoire'
import { describe, expect, it } from 'vitest'

const AFTER_E4 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
const AFTER_E4_E5 =
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2'
const AFTER_E4_C5 =
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2'

const buildTree = (): IMoveNode => ({
  _id: 'root',
  san: '',
  fen: STARTING_FEN,
  mainLine: {
    _id: 'e4',
    san: 'e4',
    fen: AFTER_E4,
    mainLine: {
      _id: 'e5',
      san: 'e5',
      fen: AFTER_E4_E5,
      mainLine: null,
      variations: []
    },
    variations: [
      {
        _id: 'c5',
        san: 'c5',
        fen: AFTER_E4_C5,
        mainLine: null,
        variations: []
      }
    ]
  },
  variations: []
})

describe('findNodeByPath', () => {
  it('returns the root for an empty path', () => {
    expect(findNodeByPath(buildTree(), [])?._id).toBe('root')
  })

  it('walks main-line segments', () => {
    expect(findNodeByPath(buildTree(), ['main', 'main'])?.san).toBe('e5')
  })

  it('walks variation segments', () => {
    expect(findNodeByPath(buildTree(), ['main', 'var:0'])?.san).toBe('c5')
  })

  it('returns null for a path that runs off the tree', () => {
    expect(findNodeByPath(buildTree(), ['main', 'main', 'main'])).toBeNull()
    expect(findNodeByPath(buildTree(), ['main', 'var:9'])).toBeNull()
  })

  it('returns null for an unrecognised segment', () => {
    expect(findNodeByPath(buildTree(), ['sideline'])).toBeNull()
  })
})

describe('cloneNode', () => {
  it('deep-copies so edits do not leak into the source', () => {
    const original = buildTree()
    const copy = cloneNode(original)

    copy.mainLine!.san = 'd4'

    expect(original.mainLine!.san).toBe('e4')
    expect(copy.mainLine).not.toBe(original.mainLine)
  })
})

describe('ensureNodeIds', () => {
  it('fills in missing ids across the whole tree', () => {
    const withIds = ensureNodeIds({
      san: '',
      fen: STARTING_FEN,
      mainLine: { san: 'e4', fen: AFTER_E4, mainLine: null, variations: [] },
      variations: [{ san: 'd4', fen: AFTER_E4, mainLine: null, variations: [] }]
    })

    expect(withIds._id).toBeTruthy()
    expect(withIds.mainLine?._id).toBeTruthy()
    expect(withIds.variations?.[0]?._id).toBeTruthy()
  })

  it('keeps ids that already exist', () => {
    expect(ensureNodeIds(buildTree())._id).toBe('root')
  })
})

describe('getParentContext', () => {
  it('returns null at the root', () => {
    expect(getParentContext(buildTree(), [])).toBeNull()
  })

  it('flags a main-line child', () => {
    const context = getParentContext(buildTree(), ['main'])

    expect(context?.isMain).toBe(true)
    expect(context?.parent._id).toBe('root')
  })

  it('reports the variation index', () => {
    const context = getParentContext(buildTree(), ['main', 'var:0'])

    expect(context?.isMain).toBe(false)
    expect(context?.varIndex).toBe(0)
    expect(context?.parent.san).toBe('e4')
  })
})

describe('getPathToNode', () => {
  it('finds a main-line node', () => {
    expect(getPathToNode(buildTree(), 'e5')).toEqual(['main', 'main'])
  })

  it('finds a variation node', () => {
    expect(getPathToNode(buildTree(), 'c5')).toEqual(['main', 'var:0'])
  })

  it('returns null for an unknown id', () => {
    expect(getPathToNode(buildTree(), 'missing')).toBeNull()
  })
})

describe('collectLinearPath', () => {
  it('walks the main line from the root', () => {
    const nodes = collectLinearPath(buildTree(), [])

    expect(nodes.map((entry) => entry.node.san)).toEqual(['', 'e4', 'e5'])
  })
})

describe('appendMainLineMove', () => {
  it('adds a continuation and returns a new tree', () => {
    const original = buildTree()
    const updated = appendMainLineMove(original, ['main', 'main'], 'Nf3', 'fen')

    expect(findNodeByPath(updated!, ['main', 'main', 'main'])?.san).toBe('Nf3')
    expect(original.mainLine?.mainLine?.mainLine).toBeNull()
  })

  it('truncates the tail when editing mid-line', () => {
    const updated = appendMainLineMove(buildTree(), ['main'], 'c5', AFTER_E4_C5)

    expect(findNodeByPath(updated!, ['main', 'main'])?.san).toBe('c5')
    expect(findNodeByPath(updated!, ['main', 'main', 'main'])).toBeNull()
  })

  it('returns null when the path does not exist', () => {
    expect(appendMainLineMove(buildTree(), ['var:5'], 'Nf3', 'fen')).toBeNull()
  })
})

describe('appendVariationMove', () => {
  it('appends without disturbing the main line', () => {
    const updated = appendVariationMove(buildTree(), ['main'], 'e6', 'fen')

    expect(updated?.mainLine?.variations).toHaveLength(2)
    expect(updated?.mainLine?.variations?.[1]?.san).toBe('e6')
    expect(updated?.mainLine?.mainLine?.san).toBe('e5')
  })

  it('returns null when the path does not exist', () => {
    expect(appendVariationMove(buildTree(), ['var:5'], 'e6', 'fen')).toBeNull()
  })
})

describe('updateNodeAnnotation', () => {
  it('writes a comment and NAGs onto the addressed node', () => {
    const updated = updateNodeAnnotation(
      buildTree(),
      ['main', 'main'],
      'Open Game',
      [1]
    )
    const node = findNodeByPath(updated!, ['main', 'main'])

    expect(node?.comment).toBe('Open Game')
    expect(node?.nags).toEqual([1])
  })

  it('clears an annotation when passed nothing', () => {
    const annotated = updateNodeAnnotation(buildTree(), ['main'], 'note', [2])
    const cleared = updateNodeAnnotation(annotated!, ['main'])

    expect(findNodeByPath(cleared!, ['main'])?.comment).toBeUndefined()
  })

  it('returns null for a missing node', () => {
    expect(updateNodeAnnotation(buildTree(), ['var:3'], 'note')).toBeNull()
  })
})

describe('promoteVariation', () => {
  it('swaps the variation into the main line and demotes the old one', () => {
    const updated = promoteVariation(buildTree(), ['main'], 0)

    expect(updated?.mainLine?.mainLine?.san).toBe('c5')
    expect(updated?.mainLine?.variations?.map((node) => node.san)).toEqual([
      'e5'
    ])
  })

  it('returns null when the variation index is out of range', () => {
    expect(promoteVariation(buildTree(), ['main'], 3)).toBeNull()
  })
})

describe('tryMove', () => {
  it('returns SAN and the resulting FEN for a legal move', () => {
    const result = tryMove(STARTING_FEN, 'e2', 'e4')

    // chess.js only records an en-passant square when a capture is available.
    expect(result?.san).toBe('e4')
    expect(result?.fen).toBe(
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
    )
  })

  it('returns null for an illegal move', () => {
    expect(tryMove(STARTING_FEN, 'e2', 'e5')).toBeNull()
  })

  it('returns null for an invalid FEN', () => {
    expect(tryMove('not-a-fen', 'e2', 'e4')).toBeNull()
  })
})

describe('getFenAtPath', () => {
  it('reads the FEN at the addressed node', () => {
    expect(getFenAtPath(buildTree(), ['main'])).toBe(AFTER_E4)
  })

  it('falls back to the root FEN for an unknown path', () => {
    expect(getFenAtPath(buildTree(), ['var:9'])).toBe(STARTING_FEN)
  })
})

describe('move numbering', () => {
  it('starts at move one before any moves are played', () => {
    expect(getMoveNumber([])).toBe(1)
    expect(isWhiteToMoveFromPath([])).toBe(true)
  })

  it('alternates sides as the path grows', () => {
    expect(isWhiteToMoveFromPath(['main'])).toBe(false)
    expect(isWhiteToMoveFromPath(['main', 'main'])).toBe(true)
  })

  it('advances the move number every full move', () => {
    expect(getMoveNumber(['main', 'main'])).toBe(2)
    expect(getMoveNumber(['main', 'main', 'main', 'main'])).toBe(3)
  })
})
