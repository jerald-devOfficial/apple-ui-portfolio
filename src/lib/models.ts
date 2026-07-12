import mongoose from 'mongoose'

export { Admin } from '@/models/Admin'
export { Blog } from '@/models/Blog'
export { Comment } from '@/models/Comment'
export { Contact } from '@/models/Contact'
export { default as Diary } from '@/models/Diary'
export { default as Repertoire } from '@/models/Repertoire'
export { User } from '@/models/User'

export const initModels = () => ({
  Admin: !!mongoose.models.Admin,
  Blog: !!mongoose.models.Blog,
  Comment: !!mongoose.models.Comment,
  Contact: !!mongoose.models.Contact,
  User: !!mongoose.models.User,
  Diary: !!mongoose.models.Diary,
  Repertoire: !!mongoose.models.Repertoire
})

export default initModels
