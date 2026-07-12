'use client'

import ChessBoardPanel from '@/app/chess/_components/ChessBoardPanel'
import EmptyRepertoireState from '@/app/chess/_components/EmptyRepertoireState'
import ImportPgnModal from '@/app/chess/_components/ImportPgnModal'
import MoveAnnotationEditor from '@/app/chess/_components/MoveAnnotationEditor'
import PgnNotationPanel from '@/app/chess/_components/PgnNotationPanel'
import RepertoireSidebar from '@/app/chess/_components/RepertoireSidebar'
import VariationControls from '@/app/chess/_components/VariationControls'
import { useMoveTree } from '@/app/chess/_hooks/useMoveTree'
import { useRepertoire } from '@/app/chess/_hooks/useRepertoire'
import { STARTING_FEN } from '@/app/chess/_lib/board-theme'
import type { IMoveNode } from '@/models/Repertoire'
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline'
import { Montserrat } from 'next/font/google'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

const ChessLayout = () => {
  const { status } = useSession()
  const router = useRouter()
  const { repertoire, isLoading, error, mutate, updateRepertoire, importPgn } =
    useRepertoire()

  const [activeColor, setActiveColor] = useState<'white' | 'black'>('white')
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  )
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null)
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>(
    'white'
  )
  const [showBoardOnMobile, setShowBoardOnMobile] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSaveRef = useRef<{
    sectionId: string
    lineId: string
    tree: IMoveNode
  } | null>(null)

  const selectedLine = useMemo(() => {
    if (!repertoire || !selectedSectionId || !selectedLineId) return null
    const section = repertoire.sections.find(
      (s) => String(s._id) === selectedSectionId
    )
    return section?.lines.find((l) => String(l._id) === selectedLineId) ?? null
  }, [repertoire, selectedSectionId, selectedLineId])

  const {
    tree,
    currentPath,
    currentNode,
    currentFen,
    isVariationMode,
    setIsVariationMode,
    resetTree,
    selectPath,
    handlePieceDrop,
    saveAnnotation,
    handlePromoteVariation: promoteVariationInTree
  } = useMoveTree(selectedLine?.tree ?? null)

  const loadedLineIdRef = useRef<string | null>(null)
  const prevLineKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    if (!repertoire) return

    const colorSections = repertoire.sections.filter(
      (s) => s.color === activeColor
    )
    if (colorSections.length === 0) return

    const section =
      colorSections.find((s) => String(s._id) === selectedSectionId) ??
      colorSections[0]

    if (String(section._id) !== selectedSectionId) {
      setSelectedSectionId(String(section._id))
    }

    const line =
      section.lines.find((l) => String(l._id) === selectedLineId) ??
      section.lines[0]

    if (line && String(line._id) !== selectedLineId) {
      setSelectedLineId(String(line._id))
    }
  }, [repertoire, activeColor, selectedSectionId, selectedLineId])

  useEffect(() => {
    if (!selectedLine?.tree) return

    const lineId = String(selectedLine._id)
    if (loadedLineIdRef.current !== lineId) {
      resetTree(selectedLine.tree)
      loadedLineIdRef.current = lineId
    }
  }, [selectedLine?._id, selectedLine?.tree, resetTree])

  useEffect(() => {
    setBoardOrientation(activeColor)
  }, [activeColor])

  const flushPendingSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }

    const pending = pendingSaveRef.current
    if (!pending) return

    pendingSaveRef.current = null

    try {
      await updateRepertoire({
        action: 'updateLineTree',
        sectionId: pending.sectionId,
        lineId: pending.lineId,
        tree: pending.tree
      })
    } catch {
      toast.error('Failed to save moves')
    }
  }, [updateRepertoire])

  useEffect(() => {
    return () => {
      void flushPendingSave()
    }
  }, [flushPendingSave])

  useEffect(() => {
    const lineKey =
      selectedSectionId && selectedLineId
        ? `${selectedSectionId}:${selectedLineId}`
        : null

    if (prevLineKeyRef.current && lineKey !== prevLineKeyRef.current) {
      void flushPendingSave()
    }

    prevLineKeyRef.current = lineKey
  }, [selectedSectionId, selectedLineId, flushPendingSave])

  const debouncedSaveTree = useCallback(
    (updatedTree: NonNullable<typeof tree>) => {
      if (!selectedSectionId || !selectedLineId) return

      pendingSaveRef.current = {
        sectionId: selectedSectionId,
        lineId: selectedLineId,
        tree: updatedTree
      }

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(() => {
        void flushPendingSave()
      }, 400)
    },
    [selectedSectionId, selectedLineId, flushPendingSave]
  )

  const onPieceDrop = useCallback(
    (source: string, target: string) => {
      const updated = handlePieceDrop(source, target)
      if (updated) {
        debouncedSaveTree(updated)
        return true
      }
      return false
    },
    [handlePieceDrop, debouncedSaveTree]
  )

  const handleSelectLine = (sectionId: string, lineId: string) => {
    setSelectedSectionId(sectionId)
    setSelectedLineId(lineId)
    setShowBoardOnMobile(true)
  }

  const handleSaveAnnotation = async (comment?: string, nags?: number[]) => {
    const updated = saveAnnotation(comment, nags)
    if (updated && selectedSectionId && selectedLineId) {
      try {
        await updateRepertoire({
          action: 'updateLineTree',
          sectionId: selectedSectionId,
          lineId: selectedLineId,
          tree: updated
        })
        toast.success('Annotation saved')
      } catch {
        toast.error('Failed to save annotation')
      }
    }
  }

  const handleImportPgn = async (pgn: string) => {
    if (!selectedSectionId || !selectedLineId) return
    try {
      const updated = await importPgn(selectedSectionId, selectedLineId, pgn)
      const section = updated.sections.find(
        (s) => String(s._id) === selectedSectionId
      )
      const line = section?.lines.find((l) => String(l._id) === selectedLineId)
      if (line?.tree) {
        resetTree(line.tree)
      }
      toast.success('PGN imported')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to import PGN')
    }
  }

  const handleExportPgn = () => {
    if (!selectedSectionId || !selectedLineId) return
    window.open(
      `/api/chess/repertoire/export/${selectedLineId}?sectionId=${selectedSectionId}`,
      '_blank'
    )
  }

  const handleAddSection = async (title: string, color: 'white' | 'black') => {
    try {
      await updateRepertoire({ action: 'addSection', sectionTitle: title, color })
      toast.success('Section added')
    } catch {
      toast.error('Failed to add section')
    }
  }

  const handleAddLine = async (sectionId: string, title: string) => {
    try {
      await updateRepertoire({
        action: 'addLine',
        sectionId,
        lineTitle: title
      })
      toast.success('Line added')
    } catch {
      toast.error('Failed to add line')
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    try {
      await updateRepertoire({ action: 'deleteSection', sectionId })
      if (selectedSectionId === sectionId) {
        setSelectedSectionId(null)
        setSelectedLineId(null)
      }
      toast.success('Section deleted')
    } catch {
      toast.error('Failed to delete section')
    }
  }

  const handleDeleteLine = async (sectionId: string, lineId: string) => {
    try {
      await updateRepertoire({ action: 'deleteLine', sectionId, lineId })
      if (selectedLineId === lineId) {
        setSelectedLineId(null)
        setShowBoardOnMobile(false)
      }
      toast.success('Line deleted')
    } catch {
      toast.error('Failed to delete line')
    }
  }

  const canPromote =
    currentPath.length > 0 && currentPath.at(-1)?.startsWith('var:')

  const handlePromoteVariation = async () => {
    const lastSegment = currentPath.at(-1)
    if (!lastSegment?.startsWith('var:')) return

    const varIndex = Number(lastSegment.replace('var:', ''))
    const parentPath = currentPath.slice(0, -1)
    const updated = promoteVariationInTree(varIndex)

    if (!updated || !selectedSectionId || !selectedLineId) return

    try {
      await updateRepertoire({
        action: 'updateLineTree',
        sectionId: selectedSectionId,
        lineId: selectedLineId,
        tree: updated
      })
      selectPath([...parentPath, 'main'])
      toast.success('Variation promoted to main line')
    } catch {
      toast.error('Failed to promote variation')
    }
  }

  const displayFen = currentFen ?? selectedLine?.tree?.fen ?? STARTING_FEN

  // Session still resolving, or guest — show loading while redirecting (avoids error flash)
  if (status === 'loading' || status === 'unauthenticated' || isLoading) {
    return (
      <main
        className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
      >
        <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
          <EmptyRepertoireState variant="loading" />
        </div>
      </main>
    )
  }

  if (error || !repertoire) {
    return (
      <main
        className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
      >
        <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
          <EmptyRepertoireState
            variant="error"
            message={
              error instanceof Error ? error.message : undefined
            }
            onRetry={() => mutate()}
          />
        </div>
      </main>
    )
  }

  return (
    <main
      className={`flex overflow-hidden h-full w-full xl:max-w-[1200px] sm:pt-6 xl:pt-12 lg:max-w-[1100px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
    >
      <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-200/50 dark:border-zinc-700/50 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md shrink-0">
          <Image
            src="/images/icons/chess.png"
            alt="Chess"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-gray-900 dark:text-white truncate">
              Chess Repertoire
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {selectedLine?.title ?? 'Select an opening line'}
            </p>
          </div>
          {selectedLineId && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => setImportModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
                Import
              </button>
              <button
                type="button"
                onClick={handleExportPgn}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Export
              </button>
            </div>
          )}
        </header>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Sidebar — hidden on mobile when board is shown */}
          <aside
            className={`${
              showBoardOnMobile ? 'hidden sm:flex' : 'flex'
            } flex-col w-full sm:w-[220px] lg:w-[260px] shrink-0 border-r border-gray-200/50 dark:border-zinc-700/50 p-3 overflow-y-auto bg-stone-100/50 dark:bg-zinc-900/80`}
          >
            <RepertoireSidebar
              sections={repertoire.sections}
              selectedLineId={selectedLineId}
              activeColor={activeColor}
              onColorChange={setActiveColor}
              onSelectLine={handleSelectLine}
              onAddSection={handleAddSection}
              onAddLine={handleAddLine}
              onDeleteSection={handleDeleteSection}
              onDeleteLine={handleDeleteLine}
            />
          </aside>

          {/* Board + notation panel */}
          <div
            className={`${
              showBoardOnMobile ? 'flex' : 'hidden sm:flex'
            } flex-1 flex-col lg:flex-row min-w-0 overflow-hidden`}
          >
            {showBoardOnMobile && (
              <button
                type="button"
                onClick={() => setShowBoardOnMobile(false)}
                className="sm:hidden flex items-center gap-1 px-4 py-2 text-blue-600 border-b border-gray-200/50 dark:border-zinc-700/50 shrink-0"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Repertoire
              </button>
            )}

            {tree && selectedLine ? (
              <>
                <div className="flex-1 flex flex-col items-center justify-start p-4 overflow-y-auto min-w-0 gap-4">
                  <VariationControls
                    isVariationMode={isVariationMode}
                    onToggleVariationMode={() =>
                      setIsVariationMode(!isVariationMode)
                    }
                    canPromote={canPromote}
                    onPromoteVariation={handlePromoteVariation}
                  />
                  <ChessBoardPanel
                    fen={displayFen}
                    orientation={boardOrientation}
                    onPieceDrop={onPieceDrop}
                    onFlip={() =>
                      setBoardOrientation((o) =>
                        o === 'white' ? 'black' : 'white'
                      )
                    }
                  />
                  <div className="sm:hidden flex gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => setImportModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium bg-gray-100 dark:bg-zinc-800"
                    >
                      <ArrowUpTrayIcon className="h-4 w-4" />
                      Import
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPgn}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium bg-gray-100 dark:bg-zinc-800"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      Export
                    </button>
                  </div>
                </div>

                <div className="lg:w-[320px] xl:w-[360px] shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200/50 dark:border-zinc-700/50 p-4 overflow-y-auto flex flex-col gap-6 bg-white/30 dark:bg-zinc-900/30">
                  <PgnNotationPanel
                    tree={tree}
                    currentPath={currentPath}
                    onSelectPath={selectPath}
                  />
                  <MoveAnnotationEditor
                    comment={currentNode?.comment}
                    nags={currentNode?.nags}
                    moveSan={currentNode?.san || undefined}
                    onSave={handleSaveAnnotation}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400">
                <p>Select or create an opening line to begin.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ImportPgnModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportPgn}
        lineTitle={selectedLine?.title}
      />
    </main>
  )
}

export default ChessLayout
