import type { H3Event } from 'h3'
import {
  compressProfileImageForUpload,
  MAX_PROFILE_UPLOAD_SOURCE_BYTES,
} from '~~/server/utils/image'
import { useHubBlob } from '~~/server/utils/r2'
import {
  normalizeNullableString,
  normalizeOptionalString,
  normalizeString,
} from '~~/server/utils/validation'
import type { ProfileSocial, ProfileUpdateBody } from '~~/types/profile'

const socialFieldNames = ['instagram', 'x', 'tiktok'] as const

export function createEmptyProfileSocial(): ProfileSocial {
  return {
    instagram: '',
    x: '',
    tiktok: '',
  }
}

export function isOwnedProfileBlob(path: unknown, userId: string): path is string {
  return typeof path === 'string' && path.startsWith(`profiles/${userId}/`)
}

export async function parseProfileUpdateBody(event: H3Event, userId: string) {
  const hubBlob = useHubBlob()
  const contentType = String(getRequestHeader(event, 'content-type') || '').toLowerCase()
  const isMultipart = contentType.includes('multipart/form-data')

  let body: ProfileUpdateBody = {}
  let pictureUploadPath: string | undefined
  let bannerUploadPath: string | undefined

  if (isMultipart) {
    const formData = (await readMultipartFormData(event)) ?? []
    const field = (name: string) =>
      formData.find(part => part.name === name && !part.filename)?.data.toString('utf8')

    const pictureFile = formData.find(part => part.name === 'pictureFile' && part.filename)
    const bannerFile = formData.find(part => part.name === 'bannerFile' && part.filename)

    body = {
      bio: field('bio'),
      social: {
        instagram: field('instagram'),
        tiktok: field('tiktok'),
        x: field('x'),
      },
    }

    if (pictureFile?.data?.length) {
      if (pictureFile.data.length > MAX_PROFILE_UPLOAD_SOURCE_BYTES) {
        throw createError({
          statusCode: 400,
          statusMessage: 'pictureFile must be less than 10MB',
        })
      }

      const pictureMimeType = String(pictureFile.type || '')
      if (!pictureMimeType.startsWith('image/')) {
        throw createError({
          statusCode: 400,
          statusMessage: 'pictureFile must be an image',
        })
      }

      const compressedPicture = await compressProfileImageForUpload(pictureFile.data, 'picture')
      const pictureUpload = await hubBlob.put(
        `picture-${Date.now()}.${compressedPicture.extension}`,
        compressedPicture.body,
        {
          prefix: `profiles/${userId}`,
          contentType: compressedPicture.contentType,
        },
      )
      pictureUploadPath = pictureUpload.pathname
    }

    if (bannerFile?.data?.length) {
      if (bannerFile.data.length > MAX_PROFILE_UPLOAD_SOURCE_BYTES) {
        throw createError({
          statusCode: 400,
          statusMessage: 'bannerFile must be less than 10MB',
        })
      }

      const bannerMimeType = String(bannerFile.type || '')
      if (!bannerMimeType.startsWith('image/')) {
        throw createError({
          statusCode: 400,
          statusMessage: 'bannerFile must be an image',
        })
      }

      const compressedBanner = await compressProfileImageForUpload(bannerFile.data, 'banner')
      const bannerUpload = await hubBlob.put(
        `banner-${Date.now()}.${compressedBanner.extension}`,
        compressedBanner.body,
        {
          prefix: `profiles/${userId}`,
          contentType: compressedBanner.contentType,
        },
      )
      bannerUploadPath = bannerUpload.pathname
    }
  } else {
    body = (await readBody<ProfileUpdateBody>(event)) ?? {}
  }

  return {
    body,
    pictureUploadPath,
    bannerUploadPath,
  }
}

export function buildProfileUpdate(body: ProfileUpdateBody, uploads?: { pictureUploadPath?: string, bannerUploadPath?: string }) {
  const update: Record<string, string | null> = {}

  if (body.bio !== undefined) {
    update.bio = normalizeString(body.bio, 'bio')
  }

  if (body.picture !== undefined) {
    update.picture = normalizeNullableString(body.picture, 'picture')
  }

  if (body.banner !== undefined) {
    update.banner = normalizeNullableString(body.banner, 'banner')
  }

  if (uploads?.pictureUploadPath) {
    update.picture = uploads.pictureUploadPath
  }

  if (uploads?.bannerUploadPath) {
    update.banner = uploads.bannerUploadPath
  }

  if (body.social) {
    if (typeof body.social !== 'object' || Array.isArray(body.social)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'social must be an object',
      })
    }

    for (const field of socialFieldNames) {
      const value = body.social[field]

      if (value !== undefined) {
        update[`social.${field}`] = normalizeOptionalString(value, `social.${field}`)
      }
    }
  }

  return update
}
