'use client'

import { RESUME_HTML_HREF, RESUME_PDF_HREF } from '@/lib/resume'
import { XMarkIcon } from '@heroicons/react/24/outline'

type ResumeActionModalProps = {
  isOpen: boolean
  onClose: () => void
}

const ResumeActionModal = ({ isOpen, onClose }: ResumeActionModalProps) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-dialog-title"
        className="w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 shadow-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-800/90">
          <h2
            id="resume-dialog-title"
            className="text-base font-semibold text-gray-900 dark:text-white"
          >
            Resume
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Download the PDF, or open the HTML version in this browser. Nothing
            starts until you choose.
          </p>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <a
              href={RESUME_HTML_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-sm font-medium text-center text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-zinc-800"
            >
              View in browser
            </a>
            <a
              href={RESUME_PDF_HREF}
              download
              className="px-4 py-2 rounded-lg text-sm font-medium text-center bg-blue-600 hover:bg-blue-700 text-white"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumeActionModal
