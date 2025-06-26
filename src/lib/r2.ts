import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!
  }
})

export const uploadFileToR2 = async (
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME!,
    Key: key,
    Body: file,
    ContentType: contentType
  })

  await r2Client.send(command)

  // Return the public URL
  return `${process.env.NEXT_PUBLIC_R2_URL}/${key}`
}

export const deleteFileFromR2 = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME!,
    Key: key
  })

  await r2Client.send(command)
}

export const getSignedUploadUrl = async (
  key: string,
  contentType: string
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME!,
    Key: key,
    ContentType: contentType
  })

  return await getSignedUrl(r2Client, command, { expiresIn: 3600 })
}
