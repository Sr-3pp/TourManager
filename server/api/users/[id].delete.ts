import mongoose from 'mongoose'
import '~~/server/models/Profile'
import { Profile } from '~~/server/models/Profile'
import { Tour } from '~~/server/models/Tour'
import { User } from '~~/server/models/User'
import { requireUserLevel } from '~~/server/utils/auth'
import { dbConnect } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await requireUserLevel(event, 3)
  await dbConnect()

  const id = String(getRouterParam(event, 'id') || '').trim()

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User id is required',
    })
  }

  if (id === session.user.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'You cannot delete your own account from the admin panel',
    })
  }

  const existingUser = await User.findById(id).select('_id email')

  if (!existingUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  const hasTours = await Tour.exists({ creator: id })

  if (hasTours) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Cannot delete a user that still owns tours',
    })
  }

  const db = mongoose.connection.db
  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database is not available',
    })
  }

  await Profile.deleteOne({ user: id })
  await User.deleteOne({ _id: id })

  // Clean up Better Auth records tied to the deleted user.
  await Promise.allSettled([
    db.collection('accounts').deleteMany({ userId: id }),
    db.collection('sessions').deleteMany({ userId: id }),
    db.collection('verifications').deleteMany({
      $or: [
        { value: id },
        { value: existingUser.email },
        { identifier: existingUser.email },
      ],
    }),
  ])

  return {
    success: true,
  }
})
