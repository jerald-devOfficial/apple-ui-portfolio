import DiaryForm from '@/app/diary/_components/DiaryForm'
import DiaryLayout from '@/app/diary/_components/DiaryLayout'

const CreateDiaryPage = () => (
  <DiaryLayout
    backLink="/diaries"
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
    <DiaryForm />
  </DiaryLayout>
)

export default CreateDiaryPage
