import mongoose, {
  Model,
  model,
  Document as MongooseDocument,
  Schema
} from 'mongoose'

export interface IUser extends Omit<MongooseDocument, 'location'> {
  _id: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
  authType: string
  googleId?: string
  isVerified: boolean

  // Social verification
  socialProfiles: {
    github?: string
    linkedin?: string
    twitter?: string
    facebook?: string
    website?: string
  }

  // User activity
  likedPosts: string[]
  bio?: string
  profession?: string
  location?: string
}

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true
    },
    avatar: {
      type: String
    },
    authType: {
      type: String,
      required: true,
      enum: ['GOOGLE', 'GITHUB'],
      default: 'GOOGLE'
    },
    googleId: {
      type: String
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    socialProfiles: {
      github: String,
      linkedin: String,
      twitter: String,
      facebook: String,
      website: String
    },
    likedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Blog'
      }
    ],
    bio: String,
    profession: String,
    location: String
  },
  { timestamps: true }
)

// Create an index for faster lookups
userSchema.index({ email: 1 })
userSchema.index({ 'socialProfiles.github': 1 })
userSchema.index({ 'socialProfiles.linkedin': 1 })

export const User = (mongoose.models.User ||
  model('User', userSchema)) as Model<IUser>
