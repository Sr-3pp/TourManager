import { Profile } from '~~/server/models/Profile'
import { ensureProfileForUser, getSessionWithProfile } from '~~/server/utils/auth'
import {
  compressProfileImageForUpload,
  MAX_PROFILE_UPLOAD_SOURCE_BYTES,
} from '~~/server/utils/image'
import { useHubBlob } from '~~/server/utils/r2'
import type { ProfileUpdateBody } from '~~/types/profile'

function normalizeString(value: unknown, field: string) {
  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} must be a string`,
    })
  }

  return value.trim()
}

function normalizeNullableString(value: unknown, field: string) {
  if (value === null) {
    return null
  }

  return normalizeString(value, field)
}

function isOwnedProfileBlob(path: unknown, userId: string): path is string {
  return typeof path === 'string' && path.startsWith(`profiles/${userId}/`)
}

export default defineEventHandler(async (event) => {
  const hubBlob = useHubBlob()
  const session = await getSessionWithProfile(event)

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  await ensureProfileForUser(session.user.id)

  const existingProfile = session.user.profile as { picture?: string | null; banner?: string | null } | undefined
  const previousPicturePath = existingProfile?.picture ?? null
  const previousBannerPath = existingProfile?.banner ?? null

  const contentType = String(getRequestHeader(event, 'content-type') || '').toLowerCase()
  const isMultipart = contentType.includes('multipart/form-data')

  let body: ProfileUpdateBody = {}
  let pictureUploadPath: string | undefined
  let bannerUploadPath: string | undefined

  if (isMultipart) {
    const formData = (await readMultipartFormData(event)) ?? []

    const field = (name: string) =>
      formData.find((part) => part.name === name && !part.filename)?.data.toString('utf8')

    const pictureFile = formData.find((part) => part.name === 'pictureFile' && part.filename)
    const bannerFile = formData.find((part) => part.name === 'bannerFile' && part.filename)

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
          prefix: `profiles/${session.user.id}`,
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
          prefix: `profiles/${session.user.id}`,
          contentType: compressedBanner.contentType,
        },
      )
      bannerUploadPath = bannerUpload.pathname
    }
  } else {
    body = (await readBody<ProfileUpdateBody>(event)) ?? {}
  }

  const update: Record<string, string | null> = {}

  if ('bio' in body && body.bio !== undefined) {
    update.bio = normalizeString(body.bio, 'bio')
  }

  if ('picture' in body && body.picture !== undefined) {
    update.picture = normalizeNullableString(body.picture, 'picture')
  }

  if (pictureUploadPath) {
    update.picture = pictureUploadPath
  }

  if ('banner' in body && body.banner !== undefined) {
    update.banner = normalizeNullableString(body.banner, 'banner')
  }

  if (bannerUploadPath) {
    update.banner = bannerUploadPath
  }

  if (body.social) {
    if (typeof body.social !== 'object' || Array.isArray(body.social)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'social must be an object',
      })
    }

    if ('instagram' in body.social && body.social.instagram !== undefined) {
      update['social.instagram'] = normalizeString(body.social.instagram, 'social.instagram')
    }

    if ('x' in body.social && body.social.x !== undefined) {
      update['social.x'] = normalizeString(body.social.x, 'social.x')
    }

    if ('tiktok' in body.social && body.social.tiktok !== undefined) {
      update['social.tiktok'] = normalizeString(body.social.tiktok, 'social.tiktok')
    }
  }

  try {
    const profile = await Profile.findOneAndUpdate(
      { user: session.user.id },
      {
        ...(Object.keys(update).length > 0 ? { $set: update } : {}),
        $setOnInsert: {
          user: session.user.id,
        },
      },
      {
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
        upsert: true,
      }
    ).lean()

    const shouldDeletePreviousPicture =
      ((pictureUploadPath && previousPicturePath !== pictureUploadPath) || update.picture === null) &&
      isOwnedProfileBlob(previousPicturePath, session.user.id)

    if (shouldDeletePreviousPicture) {
      await hubBlob.del(previousPicturePath)
    }

    const shouldDeletePreviousBanner =
      ((bannerUploadPath && previousBannerPath !== bannerUploadPath) || update.banner === null) &&
      isOwnedProfileBlob(previousBannerPath, session.user.id)

    if (shouldDeletePreviousBanner) {
      await hubBlob.del(previousBannerPath)
    }

    return {
      profile,
    }
  } catch (error) {
    if (pictureUploadPath) {
      try {
        await hubBlob.del(pictureUploadPath)
      } catch (cleanupError) {
        console.error('Failed to clean up uploaded picture after profile update error:', cleanupError)
      }
    }

    if (bannerUploadPath) {
      try {
        await hubBlob.del(bannerUploadPath)
      } catch (cleanupError) {
        console.error('Failed to clean up uploaded banner after profile update error:', cleanupError)
      }
    }

    throw error
  }
})
