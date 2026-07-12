import { Chess, type Square } from 'chess.js'
import type { IMoveNode } from '@/models/Repertoire'
import { STARTING_FEN } from '@/app/chess/_lib/board-theme'

export type MovePath = string[]

export const createNodeId = (): string => crypto.randomUUID()

export const cloneNode = (node: IMoveNode): IMoveNode => ({
  ...node,
  _id: node._id ?? createNodeId(),
  mainLine: node.mainLine ? cloneNode(node.mainLine) : null,
  variations: node.variations?.map(cloneNode) ?? []
})

export const findNodeByPath = (
  root: IMoveNode,
  path: MovePath
): IMoveNode | null => {
  let current: IMoveNode | null = root

  for (const segment of path) {
    if (!current) return null

    if (segment === 'main') {
      current = current.mainLine ?? null
      continue
    }

    if (segment.startsWith('var:')) {
      const index = Number(segment.replace('var:', ''))
      current = current.variations?.[index] ?? null
      continue
    }

    return null
  }

  return current
}

export const getParentContext = (
  root: IMoveNode,
  path: MovePath
): { parent: IMoveNode; parentPath: MovePath; isMain: boolean; varIndex?: number } | null => {
  if (path.length === 0) return null

  const parentPath = path.slice(0, -1)
  const parent = findNodeByPath(root, parentPath)
  if (!parent) return null

  const last = path.at(-1)
  if (!last) return null

  if (last === 'main') {
    return { parent, parentPath, isMain: true }
  }

  if (last.startsWith('var:')) {
    return {
      parent,
      parentPath,
      isMain: false,
      varIndex: Number(last.replace('var:', ''))
    }
  }

  return null
}

export const collectLinearPath = (
  root: IMoveNode,
  path: MovePath
): { node: IMoveNode; path: MovePath }[] => {
  const result: { node: IMoveNode; path: MovePath }[] = []
  let current: IMoveNode | null = root
  let currentPath: MovePath = []

  result.push({ node: current, path: currentPath })

  while (current?.mainLine) {
    currentPath = [...currentPath, 'main']
    current = current.mainLine
    result.push({ node: current, path: currentPath })
  }

  if (path.length === 0) return result

  const target = findNodeByPath(root, path)
  if (!target) return result

  const branchPath = path
  let branchNode = findNodeByPath(root, branchPath.slice(0, branchPath.length))
  let branchCurrentPath = branchPath.slice()

  if (!branchNode) return result

  while (branchNode?.mainLine) {
    branchCurrentPath = [...branchCurrentPath, 'main']
    branchNode = branchNode.mainLine
    result.push({ node: branchNode, path: branchCurrentPath })
  }

  return result
}

export const getPathToNode = (
  root: IMoveNode,
  targetId: string,
  path: MovePath = []
): MovePath | null => {
  if (root._id === targetId || (!root._id && path.length === 0 && targetId === 'root')) {
    return path
  }

  if (root.mainLine) {
    const mainPath = getPathToNode(root.mainLine, targetId, [...path, 'main'])
    if (mainPath) return mainPath
  }

  if (root.variations) {
    for (let i = 0; i < root.variations.length; i++) {
      const varPath = getPathToNode(root.variations[i], targetId, [
        ...path,
        `var:${i}`
      ])
      if (varPath) return varPath
    }
  }

  return null
}

export const ensureNodeIds = (node: IMoveNode): IMoveNode => {
  const withId: IMoveNode = {
    ...node,
    _id: node._id ?? createNodeId(),
    mainLine: node.mainLine ? ensureNodeIds(node.mainLine) : null,
    variations: node.variations?.map(ensureNodeIds) ?? []
  }
  return withId
}

export const appendMainLineMove = (
  root: IMoveNode,
  path: MovePath,
  san: string,
  fen: string
): IMoveNode | null => {
  const tree = cloneNode(ensureNodeIds(root))
  const parent = findNodeByPath(tree, path)
  if (!parent) return null

  const newNode: IMoveNode = {
    _id: createNodeId(),
    san,
    fen,
    mainLine: null,
    variations: []
  }

  // Replace continuation from the current node (truncate tail when editing mid-line)
  parent.mainLine = newNode

  return tree
}

export const appendVariationMove = (
  root: IMoveNode,
  path: MovePath,
  san: string,
  fen: string
): IMoveNode | null => {
  const tree = cloneNode(ensureNodeIds(root))
  const parent = findNodeByPath(tree, path)
  if (!parent) return null

  const newNode: IMoveNode = {
    _id: createNodeId(),
    san,
    fen,
    mainLine: null,
    variations: []
  }
  parent.variations = [...(parent.variations ?? []), newNode]

  return tree
}

export const updateNodeAnnotation = (
  root: IMoveNode,
  path: MovePath,
  comment?: string,
  nags?: number[]
): IMoveNode | null => {
  const tree = cloneNode(ensureNodeIds(root))
  const node = findNodeByPath(tree, path)
  if (!node) return null

  node.comment = comment
  node.nags = nags

  return tree
}

export const promoteVariation = (
  root: IMoveNode,
  path: MovePath,
  varIndex: number
): IMoveNode | null => {
  const tree = cloneNode(ensureNodeIds(root))
  const parent = findNodeByPath(tree, path)
  if (!parent?.variations?.[varIndex]) return null

  const promoted = parent.variations[varIndex]
  const oldMain = parent.mainLine

  parent.mainLine = promoted
  parent.variations = parent.variations.filter((_, i) => i !== varIndex)
  if (oldMain) {
    parent.variations = [...(parent.variations ?? []), oldMain]
  }

  return tree
}

export const tryMove = (
  fen: string,
  from: string,
  to: string,
  promotion: 'q' | 'r' | 'b' | 'n' = 'q'
): { san: string; fen: string } | null => {
  try {
    const chess = new Chess(fen)
    const move = chess.move({
      from: from as Square,
      to: to as Square,
      promotion
    })
    if (!move) return null
    return { san: move.san, fen: chess.fen() }
  } catch {
    return null
  }
}

export const getFenAtPath = (root: IMoveNode, path: MovePath): string => {
  const node = findNodeByPath(root, path)
  return node?.fen ?? root.fen ?? STARTING_FEN
}

export const getMoveNumber = (path: MovePath): number => {
  return Math.max(1, Math.ceil(path.filter((p) => p === 'main' || p.startsWith('var:')).length / 2) + 1)
}

export const isWhiteToMoveFromPath = (path: MovePath): boolean => {
  const moveCount = path.filter((p) => p === 'main' || p.startsWith('var:')).length
  return moveCount % 2 === 0
}
