import type { IMoveNode } from '@/models/Repertoire'
import {
  appendMainLineMove,
  appendVariationMove,
  findNodeByPath,
  getFenAtPath,
  promoteVariation,
  tryMove,
  updateNodeAnnotation,
  type MovePath
} from '@/app/chess/_lib/move-tree-utils'
import { useCallback, useMemo, useState } from 'react'
import { useImmer } from 'use-immer'

export const useMoveTree = (initialTree: IMoveNode | null) => {
  const [tree, setTree] = useImmer<IMoveNode | null>(initialTree)
  const [currentPath, setCurrentPath] = useState<MovePath>([])
  const [isVariationMode, setIsVariationMode] = useState(false)

  const currentNode = useMemo(() => {
    if (!tree) return null
    return findNodeByPath(tree, currentPath) ?? tree
  }, [tree, currentPath])

  const currentFen = useMemo(() => {
    if (!tree) return undefined
    return getFenAtPath(tree, currentPath)
  }, [tree, currentPath])

  const resetTree = useCallback((newTree: IMoveNode) => {
    setTree(newTree)
    setCurrentPath([])
  }, [setTree])

  const selectPath = useCallback((path: MovePath) => {
    setCurrentPath(path)
  }, [])

  const goToParent = useCallback(() => {
    setCurrentPath((prev) => prev.slice(0, -1))
  }, [])

  const goToStart = useCallback(() => {
    setCurrentPath([])
  }, [])

  const handlePieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string): IMoveNode | null => {
      if (!tree || !currentNode) return null

      const fen = currentNode.fen
      const result = tryMove(fen, sourceSquare, targetSquare)
      if (!result) return null

      const parentBefore = findNodeByPath(tree, currentPath)
      const varCount = parentBefore?.variations?.length ?? 0

      const updated = isVariationMode
        ? appendVariationMove(tree, currentPath, result.san, result.fen)
        : appendMainLineMove(tree, currentPath, result.san, result.fen)

      if (!updated) return null

      setTree(updated)

      setCurrentPath((prev) => {
        if (isVariationMode) {
          return [...prev, `var:${varCount}`]
        }
        return [...prev, 'main']
      })

      return updated
    },
    [tree, currentNode, currentPath, isVariationMode, setTree]
  )

  const saveAnnotation = useCallback(
    (comment?: string, nags?: number[]) => {
      if (!tree) return null
      const updated = updateNodeAnnotation(tree, currentPath, comment, nags)
      if (!updated) return null
      setTree(updated)
      return updated
    },
    [tree, currentPath, setTree]
  )

  const handlePromoteVariation = useCallback(
    (varIndex: number) => {
      if (!tree) return null
      const parentPath = currentPath.slice(0, -1)
      const updated = promoteVariation(tree, parentPath, varIndex)
      if (!updated) return null
      setTree(updated)
      return updated
    },
    [tree, currentPath, setTree]
  )

  return {
    tree,
    setTree,
    currentPath,
    currentNode,
    currentFen,
    isVariationMode,
    setIsVariationMode,
    resetTree,
    selectPath,
    goToParent,
    goToStart,
    handlePieceDrop,
    saveAnnotation,
    handlePromoteVariation
  }
}

export type UseMoveTreeReturn = ReturnType<typeof useMoveTree>
