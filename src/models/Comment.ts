import mongoose, { Model, model, Schema } from 'mongoose'

export interface IComment {
  _id: string
  blogId: string
  userId: string
  content: string
  parentId?: string // For nested comments (max 2 levels)
  author: {
    name: string
    email: string
    avatar?: string
  }
  likes: number
  likedBy: string[]
  createdAt: Date
  updatedAt: Date
}

const commentSchema = new Schema<IComment>(
  {
    blogId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    parentId: {
      type: String,
      default: null,
      index: true
    },
    author: {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      avatar: String
    },
    likes: {
      type: Number,
      default: 0
    },
    likedBy: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
)

// Index for efficient queries
commentSchema.index({ blogId: 1, createdAt: -1 })
commentSchema.index({ parentId: 1, createdAt: -1 })

export const Comment = (mongoose.models.Comment ||
  model('Comment', commentSchema)) as Model<IComment>
