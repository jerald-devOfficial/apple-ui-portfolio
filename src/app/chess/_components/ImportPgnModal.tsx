'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

type ImportPgnModalProps = {
  isOpen: boolean
  onClose: () => void
  onImport: (pgn: string) => Promise<void>
  lineTitle?: string
}

const ImportPgnModal = ({
  isOpen,
  onClose,
  onImport,
  lineTitle
}: ImportPgnModalProps) => {
  const [pgn, setPgn] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!pgn.trim()) return
    setIsSubmitting(true)
    try {
      await onImport(pgn.trim())
      setPgn('')
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-zinc-900 shadow-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-800/90">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Import PGN
            {lineTitle ? (
              <span className="font-normal text-gray-500 ml-1">
                — {lineTitle}
              </span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <textarea
            value={pgn}
            onChange={(e) => setPgn(e.target.value)}
            placeholder='Paste PGN here, e.g. 1. e4 e5 2. Nf3 Nc6 ...'
            rows={10}
            className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 px-3 py-2 text-sm font-mono text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!pgn.trim() || isSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors"
            >
              {isSubmitting ? 'Importing…' : 'Import'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImportPgnModal
