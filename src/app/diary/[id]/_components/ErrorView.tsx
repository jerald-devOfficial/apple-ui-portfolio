import DiaryLayout from '../../_components/DiaryLayout'

interface ErrorViewProps {
  message: string
}

const ErrorView = ({ message }: ErrorViewProps) => (
  <DiaryLayout>
    <div className="flex flex-col items-center justify-center h-full p-6">
      <p className="text-red-500 dark:text-red-400 text-lg mb-4">{message}</p>
      <button
        onClick={() => (window.location.href = '/diaries')}
        className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 rounded-lg transition-colors"
      >
        Go back to diaries
      </button>
    </div>
  </DiaryLayout>
)

export default ErrorView
