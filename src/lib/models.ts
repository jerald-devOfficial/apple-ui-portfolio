import { Admin } from '@/models/Admin'
import { Blog } from '@/models/Blog'
import { Contact } from '@/models/Contact'
import Diary from '@/models/Diary'
import { User } from '@/models/User'
import mongoose from 'mongoose'

export { Admin, Blog, Contact, Diary, User }

// Export a function to initialize models
export const initModels = () => {
  // Return the registered models for verification
  return {
    Admin: mongoose.models.Admin ? true : false,
    Blog: mongoose.models.Blog ? true : false,
    Contact: mongoose.models.Contact ? true : false,
    User: mongoose.models.User ? true : false,
    Diary: mongoose.models.Diary ? true : false
  }
}

export default initModels
