export type BlogActionState = {
  error?: string
  success: boolean
}

export const initialBlogState: BlogActionState = {
  success: false
}
