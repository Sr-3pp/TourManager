import type { H3Event } from 'h3'
import '~~/server/models/Profile'
import mongoose from 'mongoose'
import { User } from '~~/server/models/User'
import { ensureUserSlug } from '~~/server/utils/slug'
import { dbConnect } from '~~/server/utils/db'

function isObjectIdLike(value: string) {
  return /^[a-f0-9]{24}$/i.test(value)
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getSlugFromRequest(event: H3Event) {
  const routeSlug = getRouterParam(event, 'slug')

  if (routeSlug) {
    return String(routeSlug).trim().toLowerCase()
  }

  const pathname = getRequestURL(event).pathname
  const segments = pathname.split('/').filter(Boolean)
  const lastSegment = segments.at(-1)

  return String(lastSegment || '').trim().toLowerCase()
}

async function findUserBySlugOrName(slug: string) {
  const bySlug = await User.findOne({ slug }).populate('profile')

  if (bySlug) {
    return bySlug
  }

  const normalizedPattern = escapeRegex(slug).replace(/-/g, '[\\s-]+')
  return User.findOne({
    name: {
      $regex: new RegExp(`^${normalizedPattern}$`, 'i'),
    },
  }).populate('profile')
}

async function findUserBySlugOrNameRaw(slug: string) {
  const db = mongoose.connection.db

  if (!db) {
    return null
  }

  const normalizedPattern = escapeRegex(slug).replace(/-/g, '[\\s-]+')
  const doc = await db.collection('users').findOne({
    $or: [
      { slug },
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

  const slug = getSlugFromRequest(event)

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required',
    })
  }

  const user = isObjectIdLike(slug)
    ? await User.findById(slug).populate('profile')
    : (await findUserBySlugOrName(slug)) || (await findUserBySlugOrNameRaw(slug))

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Organizer not found',
    })
  }

  if (!user.slug?.trim()) {
    const ensuredSlug = await ensureUserSlug(String(user._id), user.name)
    if (ensuredSlug) {
      user.slug = ensuredSlug
    }
  }

  return {
    user: user.toJSON(),
  }
})
