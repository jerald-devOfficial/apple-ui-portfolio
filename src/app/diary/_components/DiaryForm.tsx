'use client'

import {
  createDiaryAction,
  updateDiaryAction
} from '@/app/diary/actions'
import { initialDiaryState } from '@/app/diary/state'
import DiarySaveButton from '@/app/diary/_components/DiarySaveButton'
import TinyMCEEditor from '@/components/TinyMCEEditor'
import { IDiary } from '@/models/Diary'
import { useRouter } from 'next/navigation'
import { useActionState, useState } from 'react'

type DiaryFormProps = {
  diary?: IDiary
}

const DiaryForm = ({ diary }: DiaryFormProps) => {
  const { push } = useRouter()
  const isEditing = Boolean(diary)
  const [content, setContent] = useState(diary?.content ?? '')
  const [state, formAction] = useActionState(
    isEditing ? updateDiaryAction : createDiaryAction,
    initialDiaryState
  )

  const handleDiscard = () => {
    const destination = isEditing ? `/diary/${diary?._id}` : '/diaries'
    const hasChanges = isEditing
      ? content !== (diary?.content ?? '')
      : Boolean(content)

    if (
      hasChanges &&
      !confirm('Are you sure you want to discard your changes?')
    ) {
      return
    }

    push(destination)
  }

  return (
    <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-white/80 dark:bg-zinc-900/80">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-zinc-700">
          <div className="p-6">
            <form action={formAction}>
              {diary ? (
                <input type="hidden" name="diaryId" value={diary._id} />
              ) : null}
              <input type="hidden" name="content" value={content} />

              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  defaultValue={diary?.title ?? ''}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                  placeholder="Title..."
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Content
                </label>
                <div className="rounded-lg border border-gray-300 dark:border-zinc-700 overflow-hidden">
                  <TinyMCEEditor
                    value={content}
                    onEditorChange={setContent}
                    height={300}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="publicity"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Visibility
                  </label>
                  <select
                    id="publicity"
                    name="publicity"
                    defaultValue={diary?.publicity ? 'public' : 'private'}
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="tags"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    defaultValue={diary?.tags?.join(', ') ?? ''}
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                    placeholder="life, work, ideas..."
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors w-full sm:w-auto"
                >
                  Discard
                </button>

                <div className="flex flex-col items-end w-full sm:w-auto">
                  <DiarySaveButton />
                  {state.error ? (
                    <p className="text-red-500 text-xs mt-2">{state.error}</p>
                  ) : null}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiaryForm
