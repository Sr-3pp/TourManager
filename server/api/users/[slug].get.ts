import '~~/server/models/Profile'
import { User } from '~~/server/models/User'
import { ensureUserSlug } from '~~/server/utils/slug'
import { dbConnect } from '~~/server/utils/db'

function isObjectIdLike(value: string) {
  return /^[a-f0-9]{24}$/i.test(value)
}

export default defineEventHandler(async (event) => {
  await dbConnect()

  const rawSlug = getRouterParam(event, 'slug')
  const slug = String(rawSlug || '').trim().toLowerCase()

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required',
    })
  }

  const user = isObjectIdLike(slug)
    ? await User.findById(slug).populate('profile')
    : await User.findOne({ slug }).populate('profile')

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
