'use client'

import { NAG_SYMBOLS } from '@/app/chess/_lib/board-theme'
import { useState } from 'react'

type MoveAnnotationEditorProps = {
  comment?: string
  nags?: number[]
  moveSan?: string
  onSave: (comment?: string, nags?: number[]) => void
}

const NAG_OPTIONS = Object.entries(NAG_SYMBOLS).map(([value, label]) => ({
  value: Number(value),
  label
}))

const MoveAnnotationEditor = ({
  comment: initialComment,
  nags: initialNags,
  moveSan,
  onSave
}: MoveAnnotationEditorProps) => {
  const initialNag = initialNags?.[0]
  const [comment, setComment] = useState(initialComment ?? '')
  const [selectedNag, setSelectedNag] = useState<number | undefined>(initialNag)
  const [prevProps, setPrevProps] = useState({
    comment: initialComment,
    nag: initialNag,
    moveSan
  })

  if (
    initialComment !== prevProps.comment ||
    initialNag !== prevProps.nag ||
    moveSan !== prevProps.moveSan
  ) {
    setPrevProps({ comment: initialComment, nag: initialNag, moveSan })
    setComment(initialComment ?? '')
    setSelectedNag(initialNag)
  }

  const handleSave = () => {
    onSave(
      comment.trim() || undefined,
      selectedNag !== undefined ? [selectedNag] : undefined
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
        Annotation
        {moveSan ? (
          <span className="ml-2 normal-case font-normal text-gray-500">
            — {moveSan}
          </span>
        ) : null}
      </h3>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a note for this move…"
        rows={3}
        className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      />
      <div className="flex flex-wrap gap-2">
        {NAG_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() =>
              setSelectedNag(selectedNag === value ? undefined : value)
            }
            className={`px-2.5 py-1 rounded-md text-sm font-bold transition-colors ${
              selectedNag === value
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/40'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleSave}
        className="self-start px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
      >
        Save annotation
      </button>
    </div>
  )
}

export default MoveAnnotationEditor
