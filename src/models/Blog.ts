import { Document, model, models, Schema } from 'mongoose'

// Define Author interface (could be a string or an object with details)
export interface Author {
  id?: string
  name?: string
  image?: string
  email?: string
}

// Content block interface for draggable blog content
export interface ContentBlock {
  id: string
  type: 'text' | 'code' | 'image' | 'video'
  content: string
  order: number
  metadata?: {
    language?: string // for code blocks
    caption?: string // for images/videos
    alt?: string // for images
    url?: string // for media
  }
}

// Base interface for Blog data
export interface IBlog {
  _id: string
  userId: string
  title: string
  slug: string
  summary: string
  content: string // Legacy field for backward compatibility
  contentBlocks: ContentBlock[] // New draggable content blocks
  coverImage?: string
  mediaFiles?: string[]
  tags?: string[]
  category?: string
  status: 'draft' | 'published' | 'private'
  featured: boolean
  author: Author | string
  likes?: number
  likedBy?: string[] // Array to track who liked the post
  views?: number
  readTime?: number
  commentCount?: number
  publishedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

// Document interface with Mongoose methods
export interface IBlogDocument extends Omit<IBlog, '_id'>, Document {
  createdAt: Date
  updatedAt: Date
}

const contentBlockSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'code', 'image', 'video'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  metadata: {
    language: String,
    caption: String,
    alt: String,
    url: String
  }
})

const blogSchema = new Schema<IBlogDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    summary: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    contentBlocks: {
      type: [contentBlockSchema],
      default: []
    },
    coverImage: {
      type: String
    },
    mediaFiles: {
      type: [String],
      default: []
    },
    tags: {
      type: [String],
      default: []
    },
    category: {
      type: String,
      default: 'technology'
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'private'],
      default: 'draft'
    },
    featured: {
      type: Boolean,
      default: false
    },
    author: {
      type: Schema.Types.Mixed,
      required: true
    },
    likes: {
      type: Number,
      default: 0
    },
    likedBy: {
      type: [String],
      default: []
    },
    views: {
      type: Number,
      default: 0
    },
    readTime: {
      type: Number,
      default: 0
    },
    commentCount: {
      type: Number,
      default: 0
    },
    publishedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Full-text search indexes
blogSchema.index({
  title: 'text',
  summary: 'text',
  content: 'text',
  tags: 'text'
})

// Calculate read time before saving
blogSchema.pre('save', function (next) {
  if (this.isModified('content') || this.isModified('contentBlocks')) {
    // Calculate read time based on content length
    // Average reading speed: 200-250 words per minute
    // We'll use 225 words per minute
    let text = this.content.replace(/<[^>]*>/g, ' ') // Strip HTML tags

    // Also count text from content blocks
    if (this.contentBlocks && this.contentBlocks.length > 0) {
      const blockText = this.contentBlocks
        .filter((block) => block.type === 'text')
        .map((block) => block.content.replace(/<[^>]*>/g, ' '))
        .join(' ')
      text += ' ' + blockText
    }

    const wordCount = text.split(/\s+/).length
    this.readTime = Math.ceil(wordCount / 225)
  }

  // Set publishedAt date if status is changed to published
  if (
    this.isModified('status') &&
    this.status === 'published' &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date()
  }

  next()
})

export const Blog = models?.Blog || model<IBlogDocument>('Blog', blogSchema)

export default Blog
