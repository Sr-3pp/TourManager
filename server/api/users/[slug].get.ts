import type { H3Event } from 'h3'
import '~~/server/models/Profile'
import mongoose from 'mongoose'
import { User } from '~~/server/models/User'
import { ensureUsername } from '~~/server/utils/username'
import { dbConnect } from '~~/server/utils/db'

function isObjectIdLike(value: string) {
  return /^[a-f0-9]{24}$/i.test(value)
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getUsernameFromRequest(event: H3Event) {
  const routeSlug = getRouterParam(event, 'slug')

  if (routeSlug) {
    return String(routeSlug).trim().toLowerCase()
  }

  const pathname = getRequestURL(event).pathname
  const segments = pathname.split('/').filter(Boolean)
  const lastSegment = segments.at(-1)

  return String(lastSegment || '').trim().toLowerCase()
}

async function findUserByUsernameOrName(username: string) {
  const byUsername = await User.findOne({ username }).populate('profile')

  if (byUsername) {
    return byUsername
  }

  const normalizedPattern = escapeRegex(username).replace(/-/g, '[\\s-]+')
  return User.findOne({
    name: {
      $regex: new RegExp(`^${normalizedPattern}$`, 'i'),
    },
  }).populate('profile')
}

async function findUserByUsernameOrNameRaw(username: string) {
  const db = mongoose.connection.db

  if (!db) {
    return null
  }

  const normalizedPattern = escapeRegex(username).replace(/-/g, '[\\s-]+')
  const doc = await db.collection('users').findOne({
    $or: [
      { username },
      {
        name: {
          $regex: new RegExp(`^${normalizedPattern}$`, 'i'),
        },
      },
    ],
  })

  if (!doc?._id) {
    return null
  }

  return User.findById(doc._id).populate('profile')
}

export default defineEventHandler(async (event) => {
  await dbConnect()

  const username = getUsernameFromRequest(event)

  if (!username) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username is required',
    })
  }

  const user = isObjectIdLike(username)
    ? await User.findById(username).populate('profile')
    : (await findUserByUsernameOrName(username)) || (await findUserByUsernameOrNameRaw(username))

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Organizer not found',
    })
  }

  if (!user.username?.trim()) {
    const ensuredUsername = await ensureUsername(String(user._id), user.name)
    if (ensuredUsername) {
      user.username = ensuredUsername
    }
  }

  return {
    user: user.toJSON(),
  }
})
