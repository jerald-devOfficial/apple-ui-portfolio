import DiaryLayout from '../../_components/DiaryLayout'

const LoadingView = () => (
  <DiaryLayout>
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 dark:border-zinc-600 border-t-blue-500"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-300">Loading diary...</p>
    </div>
  </DiaryLayout>
)

export default LoadingView
