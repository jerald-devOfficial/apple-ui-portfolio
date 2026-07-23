import 'server-only'

import exifReader from 'exif-reader'
import sharp from 'sharp'

import {
  isValidCaptureDate,
  parseDateFromFilename,
  parseManualCaptureDate
} from '@/lib/photo-metadata'

const parseExifDate = (value: unknown): Date | null => {
  if (value instanceof Date) {
    return isValidCaptureDate(value) ? value : null
  }

  if (typeof value === 'number') {
    const ms = value > 1e12 ? value : value * 1000
    const date = new Date(ms)
    return isValidCaptureDate(date) ? date : null
  }

  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed || trimmed.startsWith('0000')) return null

  const normalized = trimmed.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')
  const date = new Date(normalized)

  return isValidCaptureDate(date) ? date : null
}

const extractExifDate = async (buffer: Buffer): Promise<Date | null> => {
  try {
    const metadata = await sharp(buffer).metadata()

    if (!metadata.exif) return null

    const exif = exifReader(metadata.exif)

    return (
      parseExifDate(exif?.Photo?.DateTimeOriginal) ||
      parseExifDate(exif?.Photo?.DateTimeDigitized) ||
      parseExifDate(exif?.Image?.DateTime)
    )
  } catch {
    return null
  }
}

export const resolveCapturedAt = async (
  buffer: Buffer,
  filename: string,
  manualDate?: string | null
): Promise<Date | null> => {
  if (manualDate) {
    const manual = parseManualCaptureDate(manualDate)
    if (manual) return manual
  }

  const fromExif = await extractExifDate(buffer)
  if (fromExif) return fromExif

  return parseDateFromFilename(filename)
}
