import DiaryForm from '@/app/diary/_components/DiaryForm'
import DiaryLayout from '@/app/diary/_components/DiaryLayout'
import { findDiaryForEditor } from '@/lib/diary-query'
import { notFound, redirect } from 'next/navigation'

const EditDiaryPage = async ({
  params
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  const result = await findDiaryForEditor(id)

  if (result.error === 'unauthorized' || result.error === 'invalid') {
    redirect('/diaries')
  }

  if (result.error === 'not-found' || !('diary' in result)) {
    notFound()
  }

  return (
    <DiaryLayout
      backLink={`/diary/${result.diary._id}`}
      backText="Cancel"
      headerContent={
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      }
    >
      <DiaryForm diary={result.diary} />
    </DiaryLayout>
  )
}

export default EditDiaryPage
