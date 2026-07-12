'use client'

import { NAG_SYMBOLS } from '@/app/chess/_lib/board-theme'
import type { MovePath } from '@/app/chess/_lib/move-tree-utils'
import type { IMoveNode } from '@/models/Repertoire'
import { Fragment, type ReactNode } from 'react'

type PgnNotationPanelProps = {
  tree: IMoveNode
  currentPath: MovePath
  onSelectPath: (path: MovePath) => void
}

type MoveRenderProps = {
  node: IMoveNode
  path: MovePath
  moveNumber: number
  isWhiteMove: boolean
  currentPath: MovePath
  onSelectPath: (path: MovePath) => void
  depth?: number
}

const pathsEqual = (a: MovePath, b: MovePath) =>
  a.length === b.length && a.every((v, i) => v === b[i])

const MoveButton = ({
  label,
  path,
  currentPath,
  onSelectPath,
  comment,
  nags
}: {
  label: string
  path: MovePath
  currentPath: MovePath
  onSelectPath: (path: MovePath) => void
  comment?: string
  nags?: number[]
}) => {
  const isActive = pathsEqual(path, currentPath)

  return (
    <span className="inline-flex items-baseline gap-0.5">
      <button
        type="button"
        onClick={() => onSelectPath(path)}
        className={`px-1 py-0.5 rounded font-medium transition-colors ${
          isActive
            ? 'bg-blue-500/25 text-blue-700 dark:text-blue-300'
            : 'hover:bg-gray-200/80 dark:hover:bg-zinc-700/80 text-gray-900 dark:text-gray-100'
        }`}
      >
        {label}
      </button>
      {nags?.map((nag) => (
        <span
          key={nag}
          className="text-amber-600 dark:text-amber-400 text-xs font-bold"
        >
          {NAG_SYMBOLS[nag] ?? `$${nag}`}
        </span>
      ))}
      {comment && (
        <span className="text-gray-500 dark:text-gray-400 text-xs italic ml-1">
          {`{${comment}}`}
        </span>
      )}
    </span>
  )
}

const renderMainMove = (
  child: IMoveNode,
  childPath: MovePath,
  moveNumber: number,
  isWhiteMove: boolean,
  currentPath: MovePath,
  onSelectPath: (path: MovePath) => void
): { element: ReactNode; moveNumber: number; isWhiteMove: boolean } => {
  if (isWhiteMove) {
    return {
      element: (
        <Fragment key={childPath.join('-')}>
          <span className="text-gray-500 dark:text-gray-400 mr-1">
            {moveNumber}.
          </span>
          <MoveButton
            label={child.san}
            path={childPath}
            currentPath={currentPath}
            onSelectPath={onSelectPath}
            comment={child.comment}
            nags={child.nags}
          />{' '}
        </Fragment>
      ),
      moveNumber,
      isWhiteMove: false
    }
  }

  return {
    element: (
      <Fragment key={childPath.join('-')}>
        <MoveButton
          label={child.san}
          path={childPath}
          currentPath={currentPath}
          onSelectPath={onSelectPath}
          comment={child.comment}
          nags={child.nags}
        />{' '}
      </Fragment>
    ),
    moveNumber: moveNumber + 1,
    isWhiteMove: true
  }
}

const renderVariations = ({
  parentPath,
  variations,
  moveNumber,
  isWhiteMove,
  currentPath,
  onSelectPath,
  depth
}: {
  parentPath: MovePath
  variations: IMoveNode[]
  moveNumber: number
  isWhiteMove: boolean
  currentPath: MovePath
  onSelectPath: (path: MovePath) => void
  depth: number
}): ReactNode[] =>
  variations.map((variation, i) => {
    const varPath: MovePath = [...parentPath, `var:${i}`]
    return (
      <span
        key={varPath.join('-')}
        className="block ml-4 text-sm text-gray-700 dark:text-gray-300 mt-1"
        style={{ marginLeft: `${(depth + 1) * 12}px` }}
      >
        (
        <MoveButton
          label={
            isWhiteMove
              ? `${moveNumber}. ${variation.san}`
              : `${moveNumber}... ${variation.san}`
          }
          path={varPath}
          currentPath={currentPath}
          onSelectPath={onSelectPath}
          comment={variation.comment}
          nags={variation.nags}
        />
        {renderLine({
          node: variation,
          path: varPath,
          moveNumber: isWhiteMove ? moveNumber : moveNumber + 1,
          isWhiteMove: !isWhiteMove,
          currentPath,
          onSelectPath,
          depth: depth + 1
        })}
        )
      </span>
    )
  })

const renderLine = ({
  node,
  path,
  moveNumber,
  isWhiteMove,
  currentPath,
  onSelectPath,
  depth = 0
}: MoveRenderProps): ReactNode[] => {
  const elements: ReactNode[] = []
  let current = node
  let currentPathLocal = path
  let num = moveNumber
  let white = isWhiteMove

  while (current.mainLine) {
    const child = current.mainLine
    const childPath: MovePath = [...currentPathLocal, 'main']
    const rendered = renderMainMove(
      child,
      childPath,
      num,
      white,
      currentPath,
      onSelectPath
    )

    elements.push(rendered.element)
    num = rendered.moveNumber
    white = rendered.isWhiteMove

    if (child.variations?.length) {
      elements.push(
        ...renderVariations({
          parentPath: childPath,
          variations: child.variations,
          moveNumber: num,
          isWhiteMove: white,
          currentPath,
          onSelectPath,
          depth
        })
      )
    }

    current = child
    currentPathLocal = childPath
  }

  return elements
}

const PgnNotationPanel = ({
  tree,
  currentPath,
  onSelectPath
}: PgnNotationPanelProps) => {
  const moves = renderLine({
    node: tree,
    path: [],
    moveNumber: 1,
    isWhiteMove: true,
    currentPath,
    onSelectPath
  })

  return (
    <div className="flex flex-col gap-2 h-full">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
        Notation
      </h3>
      <div className="flex-1 overflow-y-auto rounded-lg bg-white/60 dark:bg-zinc-800/60 p-3 text-sm leading-relaxed border border-gray-200/50 dark:border-zinc-700/50">
        {moves.length > 0 ? (
          moves
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">
            No moves yet. Play on the board or import a PGN to begin.
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onSelectPath([])}
        className={`self-start px-2 py-1 rounded text-xs transition-colors ${
          pathsEqual(currentPath, [])
            ? 'bg-blue-500/25 text-blue-700 dark:text-blue-300'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/80 dark:hover:bg-zinc-700/80'
        }`}
      >
        Start position
      </button>
    </div>
  )
}

export default PgnNotationPanel
