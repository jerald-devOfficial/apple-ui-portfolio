'use client'

import type { IRepertoireLine, IRepertoireSection } from '@/models/Repertoire'
import {
  ChevronDownIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

type RepertoireSidebarProps = {
  sections: IRepertoireSection[]
  selectedLineId: string | null
  activeColor: 'white' | 'black'
  onColorChange: (color: 'white' | 'black') => void
  onSelectLine: (sectionId: string, lineId: string) => void
  onAddSection: (title: string, color: 'white' | 'black') => void
  onAddLine: (sectionId: string, title: string) => void
  onDeleteSection: (sectionId: string) => void
  onDeleteLine: (sectionId: string, lineId: string) => void
}

const RepertoireSidebar = ({
  sections,
  selectedLineId,
  activeColor,
  onColorChange,
  onSelectLine,
  onAddSection,
  onAddLine,
  onDeleteSection,
  onDeleteLine
}: RepertoireSidebarProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map((s) => s._id))
  )
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [newLineTitle, setNewLineTitle] = useState('')
  const [addingLineToSection, setAddingLineToSection] = useState<string | null>(
    null
  )

  const colorFiltered = sections.filter((s) => s.color === activeColor)
  const filteredSections = colorFiltered.toSorted((a, b) => a.order - b.order)

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return
    onAddSection(newSectionTitle.trim(), activeColor)
    setNewSectionTitle('')
  }

  const handleAddLine = (sectionId: string) => {
    if (!newLineTitle.trim()) return
    onAddLine(sectionId, newLineTitle.trim())
    setNewLineTitle('')
    setAddingLineToSection(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex rounded-lg bg-gray-100 dark:bg-zinc-800 p-1 mb-4">
        {(['white', 'black'] as const).map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorChange(color)}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              activeColor === color
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {color}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredSections.map((section) => (
          <SectionBlock
            key={section._id}
            section={section}
            isExpanded={expandedSections.has(section._id)}
            selectedLineId={selectedLineId}
            addingLineToSection={addingLineToSection}
            newLineTitle={newLineTitle}
            onToggle={() => toggleSection(section._id)}
            onSelectLine={(lineId) => onSelectLine(section._id, lineId)}
            onDeleteSection={() => onDeleteSection(section._id)}
            onDeleteLine={(lineId) => onDeleteLine(section._id, lineId)}
            onStartAddLine={() => setAddingLineToSection(section._id)}
            onCancelAddLine={() => {
              setAddingLineToSection(null)
              setNewLineTitle('')
            }}
            onNewLineTitleChange={setNewLineTitle}
            onConfirmAddLine={() => handleAddLine(section._id)}
          />
        ))}

        {filteredSections.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 px-2 py-4">
            No {activeColor} sections yet. Add one below.
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-zinc-700 space-y-2">
        <input
          type="text"
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
          placeholder={`New ${activeColor} section…`}
          className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
        />
        <button
          type="button"
          onClick={handleAddSection}
          className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          <PlusIcon className="h-4 w-4" />
          Add section
        </button>
      </div>
    </div>
  )
}

type SectionBlockProps = {
  section: IRepertoireSection
  isExpanded: boolean
  selectedLineId: string | null
  addingLineToSection: string | null
  newLineTitle: string
  onToggle: () => void
  onSelectLine: (lineId: string) => void
  onDeleteSection: () => void
  onDeleteLine: (lineId: string) => void
  onStartAddLine: () => void
  onCancelAddLine: () => void
  onNewLineTitleChange: (value: string) => void
  onConfirmAddLine: () => void
}

const SectionBlock = ({
  section,
  isExpanded,
  selectedLineId,
  addingLineToSection,
  newLineTitle,
  onToggle,
  onSelectLine,
  onDeleteSection,
  onDeleteLine,
  onStartAddLine,
  onCancelAddLine,
  onNewLineTitleChange,
  onConfirmAddLine
}: SectionBlockProps) => {
  const sortedLines = section.lines.toSorted((a, b) => a.order - b.order)

  return (
    <div className="rounded-lg border border-gray-200/80 dark:border-zinc-700/80 overflow-hidden">
      <div className="flex items-center gap-1 bg-white/70 dark:bg-zinc-800/70">
        <button
          type="button"
          onClick={onToggle}
          className="flex-1 flex items-center gap-2 px-3 py-2 text-left text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800"
        >
          <ChevronDownIcon
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isExpanded ? 'rotate-0' : '-rotate-90'
            }`}
          />
          {section.title}
        </button>
        <button
          type="button"
          onClick={onDeleteSection}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Delete section"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      {isExpanded && (
        <div className="px-2 py-2 space-y-1 bg-stone-50/50 dark:bg-zinc-900/50">
          {sortedLines.map((line: IRepertoireLine) => (
            <div key={line._id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelectLine(String(line._id))}
                className={`flex-1 text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                  String(selectedLineId) === String(line._id)
                    ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                {line.title}
              </button>
              <button
                type="button"
                onClick={() => onDeleteLine(line._id)}
                className="p-1.5 text-gray-400 hover:text-red-500"
                title="Delete line"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {addingLineToSection === section._id ? (
            <div className="flex gap-1 px-1 pt-1">
              <input
                type="text"
                value={newLineTitle}
                onChange={(e) => onNewLineTitleChange(e.target.value)}
                placeholder="Line name…"
                className="flex-1 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onConfirmAddLine()
                  if (e.key === 'Escape') onCancelAddLine()
                }}
              />
              <button
                type="button"
                onClick={onConfirmAddLine}
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onStartAddLine}
              className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Add line
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default RepertoireSidebar
