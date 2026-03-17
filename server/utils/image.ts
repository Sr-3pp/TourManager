import { createError } from 'h3'
import sharp from 'sharp'
import type { ProfileImageKind } from '~~/types/profile'

export const MAX_PROFILE_UPLOAD_SOURCE_BYTES = 10 * 1024 * 1024
export const MAX_PROFILE_UPLOAD_OUTPUT_BYTES = 1024 * 1024

export async function compressProfileImageForUpload(
  input: Uint8Array,
  kind: ProfileImageKind
) {
  let width = kind === 'picture' ? 1024 : 1920
  let height = kind === 'picture' ? 1024 : 1080

  for (let pass = 0; pass < 4; pass += 1) {
    for (let quality = 82; quality >= 42; quality -= 8) {
      const output = await sharp(input)
        .rotate()
        .resize({
          width,
          height,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality, effort: 4 })
        .toBuffer()

      if (output.length <= MAX_PROFILE_UPLOAD_OUTPUT_BYTES) {
        return {
          body: output,
          contentType: 'image/webp',
          extension: 'webp',
        }
      }
    }

    width = Math.max(320, Math.floor(width * 0.8))
    height = Math.max(320, Math.floor(height * 0.8))
  }

  throw createError({
    statusCode: 400,
    statusMessage: 'Image could not be compressed below 1MB',
  })
}
