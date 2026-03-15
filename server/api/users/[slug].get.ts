import '~~/server/models/Profile'
import { User } from '~~/server/models/User'

export default defineEventHandler(async (event) => {
  const rawSlug = getRouterParam(event, 'slug')
  const slug = String(rawSlug || '').trim().toLowerCase()

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required',
    })
  }

  const user = await User.findOne({ slug }).populate('profile')

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Organizer not found',
    })
  }

  return {
    user: user.toJSON(),
  }
})