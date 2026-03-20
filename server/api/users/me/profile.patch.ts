import { Profile } from '~~/server/models/Profile'
import {
  buildProfileUpdate,
  isOwnedProfileBlob,
  parseProfileUpdateBody,
} from '~~/server/services/profile'
import { ensureProfileForUser, getSessionWithProfile } from '~~/server/utils/auth'
import { useHubBlob } from '~~/server/utils/r2'

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

  const {
    body,
    pictureUploadPath,
    bannerUploadPath,
  } = await parseProfileUpdateBody(event, session.user.id)

  const update = buildProfileUpdate(body, {
    pictureUploadPath,
    bannerUploadPath,
  })

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
        returnDocument: 'after',
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
