import DiaryLayout from '@/app/diary/_components/DiaryLayout'
import DiaryView from '@/app/diary/[id]/_components/DiaryView'
import DiaryViewActions from '@/app/diary/[id]/_components/DiaryViewActions'
import ErrorView from '@/app/diary/[id]/_components/ErrorView'
import { findDiaryForViewer } from '@/lib/diary-query'
import { formatDiaryDate } from '@/utils'
import { notFound } from 'next/navigation'

const DiaryPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const result = await findDiaryForViewer(id)

  if (result.error === 'not-found' || result.error === 'invalid') {
    notFound()
  }

  if (result.error === 'unauthorized' || !('diary' in result)) {
    return (
      <ErrorView message="You do not have permission to view this diary." />
    )
  }

  const { diary } = result

  return (
    <DiaryLayout headerContent={<DiaryViewActions diary={diary} />}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {diary.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span>
            {diary.createdAt && formatDiaryDate(new Date(diary.createdAt))}
          </span>
          <span>•</span>
          <span>{diary.publicity ? 'Public' : 'Private'}</span>

          {diary.tags && diary.tags.length > 0 ? (
            <>
              <span>•</span>
              <div className="flex flex-wrap gap-2">
                {diary.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-sm bg-stone-300 dark:bg-zinc-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <DiaryView diary={diary} />
    </DiaryLayout>
  )
}

export default DiaryPage
