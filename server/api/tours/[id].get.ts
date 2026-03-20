import { Tour } from '~~/server/models/Tour'

export default defineEventHandler(async (event) => {
  const id = String(getRouterParam(event, 'id') || '').trim()

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tour id is required',
    })
  }

  const tour = await Tour.findById(id)
    .populate('creator', 'name username')
    .lean()

  if (!tour) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tour not found',
    })
  }

  return {
    tour,
  }
})
