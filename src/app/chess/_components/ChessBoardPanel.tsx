'use client'

import { getBoardSquareStyles } from '@/app/chess/_lib/board-theme'
import { Chessboard } from 'react-chessboard'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

type ChessBoardPanelProps = {
  fen: string
  orientation: 'white' | 'black'
  onPieceDrop: (source: string, target: string) => boolean
  onFlip?: () => void
}

const ChessBoardPanel = ({
  fen,
  orientation,
  onPieceDrop,
  onFlip
}: ChessBoardPanelProps) => {
  const { resolvedTheme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [boardWidth, setBoardWidth] = useState(320)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 320
      setBoardWidth(Math.min(width, 480))
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const isDark = resolvedTheme === 'dark'
  const squareStyles = getBoardSquareStyles(isDark)

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div ref={containerRef} className="w-full max-w-[480px]">
        <Chessboard
          options={{
            position: fen,
            boardOrientation: orientation,
            allowDragging: true,
            showAnimations: true,
            animationDurationInMs: 150,
            ...squareStyles,
            boardStyle: {
              width: boardWidth,
              borderRadius: '8px',
              boxShadow: isDark
                ? '0 4px 24px rgba(0,0,0,0.4)'
                : '0 4px 24px rgba(0,0,0,0.12)'
            },
            onPieceDrop: ({ sourceSquare, targetSquare }) => {
              if (!targetSquare) return false
              return onPieceDrop(sourceSquare, targetSquare)
            }
          }}
        />
      </div>
      {onFlip && (
        <button
          type="button"
          onClick={onFlip}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Flip board
        </button>
      )}
    </div>
  )
}

export default ChessBoardPanel
