import { parse } from '@mliebelt/pgn-parser'
import { Chess } from 'chess.js'
import type { IMoveNode } from '@/models/Repertoire'
import { STARTING_FEN } from '@/app/chess/_lib/board-theme'
import { createNodeId, ensureNodeIds } from '@/app/chess/_lib/move-tree-utils'

type ParsedMove = {
  move?: string
  comment?: string
  nags?: number[]
  variations?: ParsedMove[][]
}

const createMoveNode = (
  san: string,
  fen: string,
  parsed?: ParsedMove
): IMoveNode => ({
  _id: createNodeId(),
  san,
  fen,
  comment: parsed?.comment,
  nags: parsed?.nags,
  mainLine: null,
  variations: []
})

const applyParsedVariation = (
  branchParent: IMoveNode,
  variation: ParsedMove[]
): void => {
  const firstMove = variation[0]
  if (!firstMove?.move) return

  const branchChess = new Chess(branchParent.fen)

  try {
    const vm = branchChess.move(firstMove.move)
    if (!vm) return

    const varNode = createMoveNode(vm.san, branchChess.fen(), firstMove)
    branchParent.variations = [...(branchParent.variations ?? []), varNode]
    applyParsedVariations(varNode, firstMove.variations)
    applyMoveList(varNode, variation.slice(1), branchChess.fen())
  } catch {
    return
  }
}

const applyParsedVariations = (
  attachParent: IMoveNode,
  variations?: ParsedMove[][]
): void => {
  if (!variations?.length) return

  for (const variation of variations) {
    applyParsedVariation(attachParent, variation)
  }
}

const applyMoveList = (
  parent: IMoveNode,
  moves: ParsedMove[],
  startFen: string
): void => {
  const chess = new Chess(startFen)
  let attachParent = parent

  for (const parsed of moves) {
    if (!parsed.move) continue

    try {
      const move = chess.move(parsed.move)
      if (!move) continue

      const node = createMoveNode(move.san, chess.fen(), parsed)
      attachParent.mainLine = node
      applyParsedVariations(attachParent, parsed.variations)
      attachParent = node
    } catch {
      continue
    }
  }
}

export type PgnParseResult = {
  tree: IMoveNode
  hasMoves: boolean
  error?: string
}

const createEmptyRoot = (fen: string): IMoveNode => ({
  _id: createNodeId(),
  san: '',
  fen,
  mainLine: null,
  variations: []
})

export const parsePgnToTree = (pgn: string, rootFen?: string): PgnParseResult => {
  try {
    const parsed = parse(pgn, { startRule: 'game' }) as {
      moves?: ParsedMove[]
      tags?: Record<string, string>
    }

    if (!parsed.moves?.length) {
      return {
        tree: createEmptyRoot(rootFen ?? STARTING_FEN),
        hasMoves: false,
        error: 'No moves found in PGN'
      }
    }

    const fen = parsed.tags?.FEN ?? rootFen ?? STARTING_FEN
    const root = createEmptyRoot(fen)
    applyMoveList(root, parsed.moves, fen)

    if (!root.mainLine) {
      return {
        tree: ensureNodeIds(root),
        hasMoves: false,
        error: 'Could not parse any valid moves from PGN'
      }
    }

    return { tree: ensureNodeIds(root), hasMoves: true }
  } catch {
    return {
      tree: createEmptyRoot(rootFen ?? STARTING_FEN),
      hasMoves: false,
      error: 'Invalid PGN format'
    }
  }
}

export const pgnToTree = (pgn: string, rootFen?: string): IMoveNode =>
  parsePgnToTree(pgn, rootFen).tree

type PgnCursor = { moveNumber: number; isWhiteMove: boolean }

const appendMoveLabel = (
  parts: string[],
  san: string,
  cursor: PgnCursor
): PgnCursor => {
  if (cursor.isWhiteMove) {
    parts.push(`${cursor.moveNumber}. ${san}`)
    return { moveNumber: cursor.moveNumber, isWhiteMove: false }
  }

  parts.push(`${cursor.moveNumber}... ${san}`)
  return { moveNumber: cursor.moveNumber + 1, isWhiteMove: true }
}

const appendNodeAnnotations = (parts: string[], node: IMoveNode): void => {
  if (node.comment) {
    parts.push(`{${node.comment}}`)
  }
  if (node.nags?.length) {
    parts.push(node.nags.map((n) => `$${n}`).join(' '))
  }
}

const appendVariationPgn = (
  parts: string[],
  variation: IMoveNode,
  cursor: PgnCursor
): void => {
  const varParts: string[] = []
  const varCursor = appendMoveLabel(varParts, variation.san, cursor)
  appendNodeAnnotations(varParts, variation)
  appendPgnMoves(variation, varParts, varCursor)
  parts.push(`(${varParts.join(' ')})`)
}

const appendPgnMoves = (
  node: IMoveNode,
  parts: string[],
  cursor: PgnCursor
): PgnCursor => {
  if (node.mainLine) {
    const child = node.mainLine
    const nextCursor = appendMoveLabel(parts, child.san, cursor)
    appendNodeAnnotations(parts, child)
    return appendPgnMoves(child, parts, nextCursor)
  }

  if (node.variations?.length) {
    for (const variation of node.variations) {
      appendVariationPgn(parts, variation, cursor)
    }
  }

  return cursor
}

export const treeToPgn = (
  tree: IMoveNode,
  title: string,
  rootFen?: string
): string => {
  const tags = [
    `[Event "${title}"]`,
    `[Site "Repertoire"]`,
    `[Result "*"]`,
    ...(rootFen && rootFen !== STARTING_FEN
      ? [`[FEN "${rootFen}"]`, '[SetUp "1"]']
      : [])
  ]

  const moveParts: string[] = []
  appendPgnMoves(tree, moveParts, { moveNumber: 1, isWhiteMove: true })

  return `${tags.join('\n')}\n\n${moveParts.join(' ')} *`
}

export const mergePgnIntoTree = (
  existing: IMoveNode,
  pgn: string,
  rootFen?: string
): { tree: IMoveNode; hasMoves: boolean; error?: string } => {
  const imported = parsePgnToTree(pgn, rootFen ?? existing.fen)
  if (!imported.hasMoves) {
    return { tree: existing, hasMoves: false, error: imported.error }
  }

  return {
    tree: ensureNodeIds({
      ...existing,
      mainLine: imported.tree.mainLine,
      variations: [
        ...(existing.variations ?? []),
        ...(imported.tree.variations ?? [])
      ]
    }),
    hasMoves: true
  }
}
