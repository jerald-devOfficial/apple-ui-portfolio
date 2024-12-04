import mongoose, { Model, model } from 'mongoose'

export interface IDiary extends Document {
  _id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  publicity: boolean
  tags?: string[]
}

const diarySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    publicity: {
      type: Boolean,
      default: false
    },
    tags: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
)

export const Diary = (mongoose.models.Diary ||
  model('Diary', diarySchema)) as Model<IDiary>
