const MIN_CAPTURE_YEAR = 1990

// With separators (original filename) and without (sanitized R2 key strips `_`)
const FILENAME_PATTERNS = [
  /IMG[_-]?(\d{4})(\d{2})(\d{2})[_-]?(\d{2})(\d{2})(\d{2})/i,
  /VID[_-]?(\d{4})(\d{2})(\d{2})[_-]?(\d{2})(\d{2})(\d{2})/i,
  /DSC[_-]?(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/i,
  /PXL[_-]?(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/i,
  /(\d{4})(\d{2})(\d{2})[_-](\d{2})(\d{2})(\d{2})/
]

export const isValidCaptureDate = (date: Date): boolean => {
  if (Number.isNaN(date.getTime())) return false

  const year = date.getFullYear()
  const tomorrow = Date.now() + 86_400_000

  return year >= MIN_CAPTURE_YEAR && date.getTime() <= tomorrow
}

export const parseDateFromFilename = (filename: string): Date | null => {
  const baseName = filename.split(/[/\\]/).pop() ?? filename

  for (const pattern of FILENAME_PATTERNS) {
    const match = baseName.match(pattern)
    if (!match) continue

    const [, year, month, day, hour, minute, second] = match
    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    )

    if (isValidCaptureDate(date)) return date
  }

  return null
}

export const parseManualCaptureDate = (value: string): Date | null => {
  const trimmed = value.trim()
  if (!trimmed) return null

  const date = new Date(`${trimmed}T12:00:00`)
  return isValidCaptureDate(date) ? date : null
}

export type PhotoDateSource = {
  capturedAt?: Date | string | number | null
  createdAt: Date | string
  imageKey?: string
  title?: string
}

export const getPhotoDisplayDate = (photo: PhotoDateSource): Date => {
  if (photo.capturedAt != null) {
    const captured = new Date(photo.capturedAt)
    if (isValidCaptureDate(captured)) return captured
  }

  // Legacy fallback for older uploads with bad/missing capturedAt
  const fromKey = photo.imageKey ? parseDateFromFilename(photo.imageKey) : null
  if (fromKey) return fromKey

  return new Date(photo.createdAt)
}

export const formatPhotoDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
