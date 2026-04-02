import mongoose from 'mongoose'
import { User } from '~~/server/models/User'

export function normalizeUsername(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

async function buildUniqueUsername(base: string, userId?: string) {
  let candidate = base || 'organizer'
  let counter = 2

  while (
    await User.exists({
      username: candidate,
      ...(userId ? { _id: { $ne: userId } } : {}),
    })
  ) {
    candidate = `${base}-${counter}`
    counter += 1
  }

  return candidate
}

export async function ensureUsername(userId: string, fallbackName?: string) {
  const user = await User.findById(userId)
    .select('name username')
    .lean<{ name?: string; username?: string }>()

  if (!user) {
    return null
  }

  if (user.username?.trim()) {
    return user.username
  }

  const sourceName = String(user.username || user.name || fallbackName || 'organizer').trim()
  const base = normalizeUsername(sourceName) || `organizer-${String(userId).slice(-6).toLowerCase()}`
  const username = await buildUniqueUsername(base, userId)
  const objectId = new mongoose.Types.ObjectId(userId)

  await User.collection.updateOne(
    { _id: objectId },
    {
      $set: {
        username,
      },
    },
  )

  return username
}
