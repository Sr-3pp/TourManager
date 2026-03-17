export type CollectionHealth = {
  collection: string
  ok: boolean
  error?: string
}

export type R2Config = {
  endpoint?: string
  accessKey?: string
  secretKey?: string
  bucket?: string
}

export type RuntimeR2Config = {
  r2?: R2Config
  r2AccountId?: string
  r2AccessKeyId?: string
  r2SecretAccessKey?: string
  r2BucketName?: string
}

export type FileEntry = {
  pathname: string
  size?: number
  lastModified?: Date
}

export type PutBody = Blob | Uint8Array | Buffer | ReadableStream | ArrayBuffer | string
