import { createError, readBody } from 'h3'
import { Profile } from '~~/server/models/Profile'
import { ensureProfileForUser, getSessionWithProfile } from '~~/server/utils/auth'

type ProfileUpdateBody = {
  banner?: string | null
  bio?: string
  picture?: string | null
  social?: {
    instagram?: string
    tiktok?: string
    x?: string
  }
}

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

export default defineEventHandler(async (event) => {
  const session = await getSessionWithProfile(event)

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  await ensureProfileForUser(session.user.id)

  const body = (await readBody<ProfileUpdateBody>(event)) ?? {}
  const update: Record<string, string | null> = {}

  if ('bio' in body && body.bio !== undefined) {
    update.bio = normalizeString(body.bio, 'bio')
  }

  if ('picture' in body && body.picture !== undefined) {
    update.picture = normalizeNullableString(body.picture, 'picture')
  }

  if ('banner' in body && body.banner !== undefined) {
    update.banner = normalizeNullableString(body.banner, 'banner')
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

  return {
    profile,
  }
})