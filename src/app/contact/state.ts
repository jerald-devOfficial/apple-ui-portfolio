export type ContactActionState = {
  msg: string[]
  success: boolean
  emailSent?: boolean
  resetKey: number
}

export const initialContactState: ContactActionState = {
  msg: [],
  success: false,
  resetKey: 0
}
