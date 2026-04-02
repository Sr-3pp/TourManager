import { S3Client } from '@aws-sdk/client-s3'
import type { S3ClientConfig } from '@aws-sdk/client-s3'
import { getR2Config } from '~~/server/utils/r2-config'

let r2Client: S3Client | null = null

export function getR2Client() {
  if (r2Client) {
    return r2Client
  }

  const { hasR2, r2 } = getR2Config()

  try {
    if (hasR2) {
      const cfg: S3ClientConfig = {
        region: 'auto',
        endpoint: r2.endpoint,
        credentials: {
          accessKeyId: r2.accessKey as string,
          secretAccessKey: r2.secretKey as string,
        },
      }

      r2Client = new S3Client(cfg)
    }
  } catch (error) {
    console.warn('R2 client not initialized:', (error as Error).message)
    r2Client = null
  }

  return r2Client
}
