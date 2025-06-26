import mongoose, { Document, Model, model, Schema } from 'mongoose'

export interface IPhoto extends Document {
  _id: string
  title: string
  description?: string
  imageUrl: string
  imageKey: string
  uploadedBy: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

const photoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    imageKey: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: String,
      required: true
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

export const Photo = (mongoose.models.Photo ||
  model('Photo', photoSchema)) as Model<IPhoto>
