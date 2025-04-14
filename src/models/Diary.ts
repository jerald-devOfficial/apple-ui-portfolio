import { Document, model, models, Schema } from 'mongoose'

// Define types for nested objects
interface CodeSnippet {
  language: string
  code: string
  description?: string
}

interface Resource {
  url: string
  title: string
  type: 'article' | 'video' | 'documentation' | 'github' | 'other'
}

// Base interface for Diary data (for UI consumption)
export interface IDiary {
  _id: string
  userId: string
  title: string
  content: string
  publicity: boolean
  tags?: string[]
  category?: string
  codeSnippets?: CodeSnippet[]
  resources?: Resource[]
  status: 'draft' | 'published'
  isFavorite: boolean
  lastEditedSection?: string
  createdAt?: string
  updatedAt?: string
  wordCount?: number
}

// Document interface with Mongoose types (for database operations)
export interface IDiaryDocument
  extends Omit<IDiary, '_id' | 'createdAt' | 'updatedAt' | 'wordCount'>,
    Document {
  createdAt?: Date
  updatedAt?: Date
  extractCodeSnippets(): CodeSnippet[]
}

const diarySchema = new Schema<IDiaryDocument>(
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
      default: [],
      index: true
    },
    category: {
      type: String,
      enum: [
        'tutorial',
        'bug-fix',
        'learning',
        'project',
        'ideas',
        'snippet',
        'other'
      ],
      default: 'other',
      index: true
    },
    codeSnippets: [
      {
        language: {
          type: String,
          required: true
        },
        code: {
          type: String,
          required: true
        },
        description: String
      }
    ],
    resources: [
      {
        url: {
          type: String,
          required: true
        },
        title: {
          type: String,
          required: true
        },
        type: {
          type: String,
          enum: ['article', 'video', 'documentation', 'github', 'other'],
          default: 'other'
        }
      }
    ],
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published'
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    lastEditedSection: String
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Full-text search indexes
diarySchema.index({
  title: 'text',
  content: 'text',
  'codeSnippets.code': 'text'
})

// Virtual for word count
diarySchema.virtual('wordCount').get(function () {
  return this.content
    ? this.content
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ').length
    : 0
})

// Method to extract code snippets from content
diarySchema.methods.extractCodeSnippets = function (
  this: IDiaryDocument
): CodeSnippet[] {
  // This would extract code blocks from TinyMCE content
  // Basic regex to find code blocks with language tags
  const codeBlockRegex =
    /<pre class="language-([a-zA-Z0-9]+)"><code>([\s\S]*?)<\/code><\/pre>/g
  const snippets: CodeSnippet[] = []
  let match: RegExpExecArray | null

  if (!this.content) return snippets

  while ((match = codeBlockRegex.exec(this.content)) !== null) {
    snippets.push({
      language: match[1],
      code: match[2],
      description: 'Extracted from content'
    })
  }

  return snippets
}

// Update code snippets array before saving
diarySchema.pre('save', function (next) {
  if (this.isModified('content')) {
    // Cast this to IDiaryDocument to use the method
    const diaryDoc = this as unknown as IDiaryDocument
    const extractedSnippets = diaryDoc.extractCodeSnippets()

    // Only add extracted snippets that aren't already in codeSnippets array
    if (extractedSnippets.length > 0) {
      const existingCodes = new Set(diaryDoc.codeSnippets?.map((s) => s.code))
      const newSnippets = extractedSnippets.filter(
        (s) => !existingCodes.has(s.code)
      )

      if (!diaryDoc.codeSnippets) {
        diaryDoc.codeSnippets = newSnippets
      } else {
        diaryDoc.codeSnippets.push(...newSnippets)
      }
    }
  }
  next()
})

const Diary = models?.Diary || model<IDiaryDocument>('Diary', diarySchema)

export default Diary
