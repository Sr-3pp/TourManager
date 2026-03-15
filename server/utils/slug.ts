import { User } from '~~/server/models/User'

export function slugifyName(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

async function buildUniqueSlug(base: string, userId?: string) {
  let candidate = base || 'organizer'
  let counter = 2

  while (
    await User.exists({
      slug: candidate,
      ...(userId ? { _id: { $ne: userId } } : {}),
    })
  ) {
    candidate = `${base}-${counter}`
    counter += 1
  }

  return candidate
}

export async function ensureUserSlug(userId: string, fallbackName?: string) {
  const user = await User.findById(userId).select('name slug').lean<{ name?: string; slug?: string }>()

  if (!user) {
    return null
  }

  if (user.slug && user.slug.trim()) {
    return user.slug
  }

  const sourceName = String(user.name || fallbackName || 'organizer').trim()
  const base = slugifyName(sourceName) || `organizer-${String(userId).slice(-6).toLowerCase()}`
  const slug = await buildUniqueSlug(base, userId)

  await User.updateOne(
    {
      _id: userId,
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }],
    },
    {
      $set: { slug },
    },
  )

  return slug
}