'use client'

type VariationControlsProps = {
  isVariationMode: boolean
  onToggleVariationMode: () => void
  onPromoteVariation?: () => void
  canPromote?: boolean
}

const VariationControls = ({
  isVariationMode,
  onToggleVariationMode,
  onPromoteVariation,
  canPromote
}: VariationControlsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onToggleVariationMode}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          isVariationMode
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700'
        }`}
      >
        {isVariationMode ? 'Variation mode on' : 'Add variation'}
      </button>
      {canPromote && onPromoteVariation && (
        <button
          type="button"
          onClick={onPromoteVariation}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
        >
          Promote to main line
        </button>
      )}
    </div>
  )
}

export default VariationControls
