export type DiaryActionState = {
  error?: string
  success: boolean
}

export const initialDiaryState: DiaryActionState = {
  success: false
}
