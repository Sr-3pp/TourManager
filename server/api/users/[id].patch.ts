import '~~/server/models/Profile'
import mongoose from 'mongoose'
import { Profile } from '~~/server/models/Profile'
import { User } from '~~/server/models/User'
import { getAuth, requireUserLevel } from '~~/server/utils/auth'
import { dbConnect } from '~~/server/utils/db'
import type { AdminUserUpdateBody } from '~~/types/user'

const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 128

function normalizeString(value: unknown, field: string) {
  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} must be a string`,
    })
  }

  const normalized = value.trim()

  if (!normalized) {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} is required`,
    })
  }

  return normalized
}

function normalizeOptionalString(value: unknown, field: string) {
  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} must be a string`,
    })
  }

  return value.trim()
}

function normalizeLevel(value: unknown) {
  const level = Number(value)

  if (!Number.isInteger(level) || level < 1 || level > 3) {
    throw createError({
      statusCode: 400,
      statusMessage: 'level must be an integer between 1 and 3',
    })
  }

  return level
}

function normalizePassword(value: unknown) {
  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'password must be a string',
    })
  }

  if (value.length < MIN_PASSWORD_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    })
  }

  if (value.length > MAX_PASSWORD_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `password must be at most ${MAX_PASSWORD_LENGTH} characters`,
    })
  }

  return value
}

export default defineEventHandler(async (event) => {
  await requireUserLevel(event, 3)
  await dbConnect()

  const id = String(getRouterParam(event, 'id') || '').trim()

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User id is required',
    })
  }

  const body = (await readBody<AdminUserUpdateBody>(event)) ?? {}
  const userUpdate: Record<string, string | number> = {}
  const profileUpdate: Record<string, string> = {}
  let password: string | undefined

  if ('name' in body && body.name !== undefined) {
    userUpdate.name = normalizeString(body.name, 'name')
  }

  if ('email' in body && body.email !== undefined) {
    userUpdate.email = normalizeString(body.email, 'email').toLowerCase()
  }

  if ('level' in body && body.level !== undefined) {
    userUpdate.level = normalizeLevel(body.level)
  }

  if ('password' in body && body.password !== undefined && body.password !== '') {
    password = normalizePassword(body.password)
  }

  if (body.profile) {
    if (typeof body.profile !== 'object' || Array.isArray(body.profile)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'profile must be an object',
      })
    }

    if ('bio' in body.profile && body.profile.bio !== undefined) {
      profileUpdate.bio = normalizeOptionalString(body.profile.bio, 'profile.bio')
    }

    if (body.profile.social) {
      if (typeof body.profile.social !== 'object' || Array.isArray(body.profile.social)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'profile.social must be an object',
        })
      }

      for (const field of ['instagram', 'x', 'tiktok'] as const) {
        const value = body.profile.social[field]

        if (value !== undefined) {
          profileUpdate[`social.${field}`] = normalizeOptionalString(value, `profile.social.${field}`)
        }
      }
    }
  }

  const existingUser = await User.findById(id)

  if (!existingUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  try {
    if (Object.keys(userUpdate).length > 0) {
      const db = mongoose.connection.db

      if (!db) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Database is not available',
        })
      }

      await db.collection('users').updateOne(
        { _id: existingUser._id },
        {
          $set: {
            ...userUpdate,
            updatedAt: new Date(),
          },
        },
      )
    }

    if (Object.keys(profileUpdate).length > 0) {
      await Profile.findOneAndUpdate(
        { user: id },
        {
          $set: profileUpdate,
          $setOnInsert: {
            user: id,
          },
        },
        {
          returnDocument: 'after',
          runValidators: true,
          setDefaultsOnInsert: true,
          upsert: true,
        },
      )
    }

    if (password) {
      const auth = await getAuth()
      const authContext = await (auth as any).$context
      const db = mongoose.connection.db

      if (!db) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Database is not available',
        })
      }

      const accounts = db.collection('accounts')
      const credentialAccount = await accounts.findOne({
        userId: id,
        providerId: 'credential',
      })
      const hashedPassword = await authContext.password.hash(password)

      if (credentialAccount) {
        await authContext.internalAdapter.updatePassword(id, hashedPassword)
      } else {
        await accounts.insertOne({
          id: crypto.randomUUID(),
          userId: id,
          accountId: id,
          providerId: 'credential',
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === 11000) {
      throw createError({
        statusCode: 409,
        statusMessage: 'A user with that email already exists',
      })
    }

    throw error
  }

  const updatedUser = await User.findById(id).populate('profile')

  return {
    user: updatedUser?.toJSON(),
  }
})
